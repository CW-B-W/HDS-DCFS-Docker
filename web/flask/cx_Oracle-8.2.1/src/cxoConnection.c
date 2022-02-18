//-----------------------------------------------------------------------------
// Copyright (c) 2016, 2020, Oracle and/or its affiliates. All rights reserved.
//
// Portions Copyright 2007-2015, Anthony Tuininga. All rights reserved.
//
// Portions Copyright 2001-2007, Computronix (Canada) Ltd., Edmonton, Alberta,
// Canada. All rights reserved.
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// cxoConnection.c
//   Definition of the Python type Connection.
//-----------------------------------------------------------------------------

#include "cxoModule.h"

//-----------------------------------------------------------------------------
// structure used to help in establishing a connection
//-----------------------------------------------------------------------------
typedef struct {
    const char *encoding;
    const char *nencoding;
    cxoBuffer userNameBuffer;
    cxoBuffer passwordBuffer;
    cxoBuffer newPasswordBuffer;
    cxoBuffer dsnBuffer;
    cxoBuffer connectionClassBuffer;
    cxoBuffer editionBuffer;
    cxoBuffer tagBuffer;
    uint32_t numAppContext;
    dpiAppContext *appContext;
    cxoBuffer *ctxNamespaceBuffers;
    cxoBuffer *ctxNameBuffers;
    cxoBuffer *ctxValueBuffers;
    dpiShardingKeyColumn *shardingKeyColumns;
    cxoBuffer *shardingKeyBuffers;
    uint32_t numShardingKeyColumns;
    dpiShardingKeyColumn *superShardingKeyColumns;
    uint32_t numSuperShardingKeyColumns;
    cxoBuffer *superShardingKeyBuffers;
} cxoConnectionParams;


//-----------------------------------------------------------------------------
// cxoConnectionParams_initialize()
//   Initialize the parameters to default values.
//-----------------------------------------------------------------------------
static void cxoConnectionParams_initialize(cxoConnectionParams *params)
{
    cxoBuffer_init(&params->userNameBuffer);
    cxoBuffer_init(&params->passwordBuffer);
    cxoBuffer_init(&params->newPasswordBuffer);
    cxoBuffer_init(&params->dsnBuffer);
    cxoBuffer_init(&params->connectionClassBuffer);
    cxoBuffer_init(&params->editionBuffer);
    cxoBuffer_init(&params->tagBuffer);
    params->numAppContext = 0;
    params->appContext = NULL;
    params->ctxNamespaceBuffers = NULL;
    params->ctxNameBuffers = NULL;
    params->ctxValueBuffers = NULL;
    params->numShardingKeyColumns = 0;
    params->shardingKeyColumns = NULL;
    params->shardingKeyBuffers = NULL;
    params->numSuperShardingKeyColumns = 0;
    params->superShardingKeyColumns = NULL;
    params->superShardingKeyBuffers = NULL;
}


//-----------------------------------------------------------------------------
// cxoConnectionParams_ProcessContext()
//   Process context for the connection parameters. This validates that the
// context passed in is a list of 3-tuples (namespace, name, value) and
// populates the parametrs with buffers for each of these.
//-----------------------------------------------------------------------------
static int cxoConnectionParams_processContext(cxoConnectionParams *params,
        PyObject *context)
{
    uint32_t numEntries, i;
    dpiAppContext *entry;
    PyObject *entryObj;
    size_t memorySize;

    // validate context is a list with at least one entry in it
    if (!context)
        return 0;
    if (!PyList_Check(context)) {
        PyErr_SetString(PyExc_TypeError,
                "appcontext should be a list of 3-tuples");
        return -1;
    }
    numEntries = (uint32_t) PyList_GET_SIZE(context);
    if (numEntries == 0)
        return 0;

    // allocate memory for the buffers used to communicate with DPI
    params->appContext = PyMem_Malloc(numEntries * sizeof(dpiAppContext));
    memorySize = numEntries * sizeof(cxoBuffer);
    params->ctxNamespaceBuffers = PyMem_Malloc(memorySize);
    params->ctxNameBuffers = PyMem_Malloc(memorySize);
    params->ctxValueBuffers = PyMem_Malloc(memorySize);
    if (!params->appContext || !params->ctxNamespaceBuffers ||
            !params->ctxNameBuffers || !params->ctxValueBuffers) {
        PyErr_NoMemory();
        return -1;
    }

    // initialize buffers
    for (i = 0; i < numEntries; i++) {
        cxoBuffer_init(&params->ctxNamespaceBuffers[i]);
        cxoBuffer_init(&params->ctxNameBuffers[i]);
        cxoBuffer_init(&params->ctxValueBuffers[i]);
    }
    params->numAppContext = numEntries;

    // process each entry
    for (i = 0; i < numEntries; i++) {
        entryObj = PyList_GET_ITEM(context, i);
        if (!PyTuple_Check(entryObj) || PyTuple_GET_SIZE(entryObj) != 3) {
            PyErr_SetString(PyExc_TypeError,
                    "appcontext should be a list of 3-tuples");
            return -1;
        }
        if (cxoBuffer_fromObject(&params->ctxNamespaceBuffers[i],
                PyTuple_GET_ITEM(entryObj, 0), params->encoding) < 0)
            return -1;
        if (cxoBuffer_fromObject(&params->ctxNameBuffers[i],
                PyTuple_GET_ITEM(entryObj, 1), params->encoding) < 0)
            return -1;
        if (cxoBuffer_fromObject(&params->ctxValueBuffers[i],
                PyTuple_GET_ITEM(entryObj, 2), params->encoding) < 0)
            return -1;
        entry = &params->appContext[i];
        entry->namespaceName = params->ctxNamespaceBuffers[i].ptr;
        entry->namespaceNameLength = params->ctxNamespaceBuffers[i].size;
        entry->name = params->ctxNameBuffers[i].ptr;
        entry->nameLength = params->ctxNameBuffers[i].size;
        entry->value = params->ctxValueBuffers[i].ptr;
        entry->valueLength = params->ctxValueBuffers[i].size;
    }

    return 0;
}


//-----------------------------------------------------------------------------
// cxoConnectionParams_processShardingKeyValue()
//   Process a single sharding key value.
//-----------------------------------------------------------------------------
static int cxoConnectionParams_processShardingKeyValue(
        cxoConnectionParams *params, PyObject *value,
        dpiShardingKeyColumn *column, cxoBuffer *buffer)
{
    dpiNativeTypeNum nativeTypeNum;
    cxoTransformNum transformNum;

    transformNum = cxoTransform_getNumFromPythonValue(value, 0);
    if (cxoTransform_fromPython(transformNum, &nativeTypeNum, value,
            &column->value, buffer, params->encoding, params->nencoding, NULL,
            0) < 0)
        return -1;
    cxoTransform_getTypeInfo(transformNum, &column->oracleTypeNum,
            &column->nativeTypeNum);
    return 0;
}


//-----------------------------------------------------------------------------
// cxoConnectionParams_processShardingKey()
//   Process either the sharding key or the super sharding key. A sharding key
// is expected to be a sequence of values. A null value or a sequence of size
// 0 is ignored.
//-----------------------------------------------------------------------------
static int cxoConnectionParams_processShardingKey(cxoConnectionParams *params,
        PyObject *shardingKeyObj, int isSuperShardingKey)
{
    dpiShardingKeyColumn *columns;
    uint32_t i, numColumns;
    cxoBuffer *buffers;
    PyObject *value;

    // validate sharding key
    if (!shardingKeyObj || shardingKeyObj == Py_None)
        return 0;
    if (!PySequence_Check(shardingKeyObj)) {
        PyErr_SetString(PyExc_TypeError, "expecting a sequence");
        return -1;
    }
    numColumns = (uint32_t) PySequence_Size(shardingKeyObj);
    if (numColumns == 0)
        return 0;

    // allocate memory for the sharding key values
    columns = PyMem_Calloc(numColumns, sizeof(dpiShardingKeyColumn));
    buffers = PyMem_Calloc(numColumns, sizeof(cxoBuffer));
    if (!columns || !buffers) {
        PyErr_NoMemory();
        return -1;
    }
    if (isSuperShardingKey) {
        params->superShardingKeyColumns = columns;
        params->superShardingKeyBuffers = buffers;
        params->numSuperShardingKeyColumns = numColumns;
    } else {
        params->shardingKeyColumns = columns;
        params->shardingKeyBuffers = buffers;
        params->numShardingKeyColumns = numColumns;
    }

    // process each value
    for (i = 0; i < numColumns; i++) {
        value = PySequence_GetItem(shardingKeyObj, i);
        if (!value)
            return -1;
        if (cxoConnectionParams_processShardingKeyValue(params, value,
                &columns[i], &buffers[i]) < 0)
            return -1;
        Py_DECREF(value);
    }

    return 0;
}


//-----------------------------------------------------------------------------
// cxoConnectionParams_finalize()
//   Finalize the parameters, freeing any resources that were allocated. The
// return value is a convenience to the caller.
//-----------------------------------------------------------------------------
static int cxoConnectionParams_finalize(cxoConnectionParams *params)
{
    uint32_t i;

    cxoBuffer_clear(&params->userNameBuffer);
    cxoBuffer_clear(&params->passwordBuffer);
    cxoBuffer_clear(&params->newPasswordBuffer);
    cxoBuffer_clear(&params->dsnBuffer);
    cxoBuffer_clear(&params->connectionClassBuffer);
    cxoBuffer_clear(&params->editionBuffer);
    cxoBuffer_clear(&params->tagBuffer);
    for (i = 0; i < params->numAppContext; i++) {
        cxoBuffer_clear(&params->ctxNamespaceBuffers[i]);
        cxoBuffer_clear(&params->ctxNameBuffers[i]);
        cxoBuffer_clear(&params->ctxValueBuffers[i]);
    }
    params->numAppContext = 0;
    if (params->appContext) {
        PyMem_Free(params->appContext);
        params->appContext = NULL;
    }
    if (params->ctxNamespaceBuffers) {
        PyMem_Free(params->ctxNamespaceBuffers);
        params->ctxNamespaceBuffers = NULL;
    }
    if (params->ctxNameBuffers) {
        PyMem_Free(params->ctxNameBuffers);
        params->ctxNameBuffers = NULL;
    }
    if (params->ctxValueBuffers) {
        PyMem_Free(params->ctxValueBuffers);
        params->ctxValueBuffers = NULL;
    }
    for (i = 0; i < params->numShardingKeyColumns; i++)
        cxoBuffer_clear(&params->shardingKeyBuffers[i]);
    if (params->shardingKeyColumns) {
        PyMem_Free(params->shardingKeyColumns);
        params->shardingKeyColumns = NULL;
    }
    if (params->shardingKeyBuffers) {
        PyMem_Free(params->shardingKeyBuffers);
        params->shardingKeyBuffers = NULL;
    }
    for (i = 0; i < params->numSuperShardingKeyColumns; i++)
        cxoBuffer_clear(&params->superShardingKeyBuffers[i]);
    if (params->superShardingKeyColumns) {
        PyMem_Free(params->superShardingKeyColumns);
        params->superShardingKeyColumns = NULL;
    }
    if (params->superShardingKeyBuffers) {
        PyMem_Free(params->superShardingKeyBuffers);
        params->superShardingKeyBuffers = NULL;
    }
    return -1;
}


//-----------------------------------------------------------------------------
// cxoConnection_getSodaFlags()
//   Get the flags to use for SODA. This checks the autocommit flag and enables
// atomic commit if set to a true value. It also checks to ensure that the
// connection is valid.
//-----------------------------------------------------------------------------
int cxoConnection_getSodaFlags(cxoConnection *conn, uint32_t *flags)
{
    if (cxoConnection_isConnected(conn) < 0)
        return -1;
    *flags = (conn->autocommit) ? DPI_SODA_FLAGS_ATOMIC_COMMIT :
            DPI_SODA_FLAGS_DEFAULT;
    return 0;
}


//-----------------------------------------------------------------------------
// cxoConnection_isConnected()
//   Determines if the connection object is connected to the database. If not,
// a Python exception is raised.
//-----------------------------------------------------------------------------
int cxoConnection_isConnected(cxoConnection *conn)
{
    if (!conn->handle) {
        cxoError_raiseFromString(cxoInterfaceErrorException, "not connected");
        return -1;
    }
    return 0;
}


//-----------------------------------------------------------------------------
// cxoConnection_getAttrText()
//   Get the value of the attribute returned from the given function. The value
// is assumed to be a text value.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_getAttrText(cxoConnection *conn,
        int (*func)(dpiConn *conn, const char **value, uint32_t *valueLength))
{
    uint32_t valueLength;
    const char *value;

    if (cxoConnection_isConnected(conn) < 0)
        return NULL;
    if ((*func)(conn->handle, &value, &valueLength) < 0)
        return cxoError_raiseAndReturnNull();
    if (!value)
        Py_RETURN_NONE;
    return PyUnicode_Decode(value, valueLength, conn->encodingInfo.encoding,
            NULL);
}


//-----------------------------------------------------------------------------
// cxoConnection_setAttrText()
//   Set the value of the attribute using the given function. The value is
// assumed to be a text value.
//-----------------------------------------------------------------------------
static int cxoConnection_setAttrText(cxoConnection *conn, PyObject *value,
        int (*func)(dpiConn *conn, const char *value, uint32_t valueLength))
{
    cxoBuffer buffer;
    int status;

    if (cxoConnection_isConnected(conn) < 0)
        return -1;
    if (cxoBuffer_fromObject(&buffer, value, conn->encodingInfo.encoding))
        return -1;
    status = (*func)(conn->handle, buffer.ptr, buffer.size);
    cxoBuffer_clear(&buffer);
    if (status < 0)
        return cxoError_raiseAndReturnInt();
    return 0;
}


//-----------------------------------------------------------------------------
// cxoConnection_changePassword()
//   Change the password for the given connection.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_changePassword(cxoConnection *conn,
        PyObject *args)
{
    cxoBuffer usernameBuffer, oldPasswordBuffer, newPasswordBuffer;
    PyObject *oldPasswordObj, *newPasswordObj;
    int status;

    // parse the arguments
    if (cxoConnection_isConnected(conn) < 0)
        return NULL;
    if (!PyArg_ParseTuple(args, "OO", &oldPasswordObj, &newPasswordObj))
        return NULL;

    // populate buffers
    cxoBuffer_init(&usernameBuffer);
    cxoBuffer_init(&oldPasswordBuffer);
    cxoBuffer_init(&newPasswordBuffer);
    if (cxoBuffer_fromObject(&usernameBuffer, conn->username,
                    conn->encodingInfo.encoding) < 0 ||
            cxoBuffer_fromObject(&oldPasswordBuffer, oldPasswordObj,
                    conn->encodingInfo.encoding) < 0 ||
            cxoBuffer_fromObject(&newPasswordBuffer, newPasswordObj,
                    conn->encodingInfo.encoding) < 0) {
        cxoBuffer_clear(&usernameBuffer);
        cxoBuffer_clear(&oldPasswordBuffer);
        cxoBuffer_clear(&newPasswordBuffer);
        return NULL;
    }

    // change the password
    Py_BEGIN_ALLOW_THREADS
    status = dpiConn_changePassword(conn->handle, usernameBuffer.ptr,
            usernameBuffer.size, oldPasswordBuffer.ptr, oldPasswordBuffer.size,
            newPasswordBuffer.ptr, newPasswordBuffer.size);
    Py_END_ALLOW_THREADS
    cxoBuffer_clear(&usernameBuffer);
    cxoBuffer_clear(&oldPasswordBuffer);
    cxoBuffer_clear(&newPasswordBuffer);
    if (status < 0)
        return cxoError_raiseAndReturnNull();

    Py_RETURN_NONE;
}


//-----------------------------------------------------------------------------
// cxoConnection_new()
//   Create a new connection object and return it.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_new(PyTypeObject *type, PyObject *args,
        PyObject *keywordArgs)
{
    return type->tp_alloc(type, 0);
}


//-----------------------------------------------------------------------------
// cxoConnection_splitComponent()
//   Split the component out of the source if the split string is found and
// return the "before" and "after" parts.
//-----------------------------------------------------------------------------
static int cxoConnection_splitComponent(PyObject *sourceObj,
        const char *splitString, const char *methodName,
        PyObject **beforePartObj, PyObject **afterPartObj)
{
    Py_ssize_t size, pos;
    PyObject *posObj;

    posObj = PyObject_CallMethod(sourceObj, methodName, "s", splitString);
    if (!posObj)
        return -1;
    pos = PyLong_AsLong(posObj);
    Py_DECREF(posObj);
    if (PyErr_Occurred())
        return -1;
    if (pos < 0) {
        *beforePartObj = *afterPartObj = NULL;
    } else {
        size = PySequence_Size(sourceObj);
        if (PyErr_Occurred())
            return -1;
        *afterPartObj = PySequence_GetSlice(sourceObj, pos + 1, size);
        if (!*afterPartObj)
            return -1;
        *beforePartObj = PySequence_GetSlice(sourceObj, 0, pos);
        if (!*beforePartObj) {
            Py_DECREF(*afterPartObj);
            *afterPartObj = NULL;
            return -1;
        }
    }
    return 0;
}


//-----------------------------------------------------------------------------
// cxoConnection_init()
//   Initialize the connection members.
//-----------------------------------------------------------------------------
static int cxoConnection_init(cxoConnection *conn, PyObject *args,
        PyObject *keywordArgs)
{
    PyObject *usernameObj, *passwordObj, *dsnObj, *cclassObj, *editionObj;
    int status, temp, invokeSessionCallback, threaded, events;
    PyObject *shardingKeyObj, *superShardingKeyObj, *tempObj;
    PyObject *beforePartObj, *afterPartObj;
    dpiCommonCreateParams dpiCommonParams;
    dpiConnCreateParams dpiCreateParams;
    unsigned long long externalHandle;
    PyObject *tagObj, *contextObj;
    unsigned int stmtCacheSize;
    cxoConnectionParams params;
    PyObject *newPasswordObj;
    cxoSessionPool *pool;

    // define keyword arguments
    static char *keywordList[] = { "user", "password", "dsn", "mode",
            "handle", "pool", "threaded", "events", "cclass", "purity",
            "newpassword", "encoding", "nencoding", "edition", "appcontext",
            "tag", "matchanytag", "shardingkey", "supershardingkey",
            "stmtcachesize", NULL };

    // parse arguments
    pool = NULL;
    tagObj = Py_None;
    threaded = 0;
    externalHandle = 0;
    newPasswordObj = usernameObj = NULL;
    passwordObj = dsnObj = cclassObj = editionObj = NULL;
    contextObj = shardingKeyObj = superShardingKeyObj = NULL;
    stmtCacheSize = DPI_DEFAULT_STMT_CACHE_SIZE;
    if (cxoUtils_initializeDPI(NULL) < 0)
        return -1;
    if (dpiContext_initCommonCreateParams(cxoDpiContext, &dpiCommonParams) < 0)
        return cxoError_raiseAndReturnInt();
    if (dpiContext_initConnCreateParams(cxoDpiContext, &dpiCreateParams) < 0)
        return cxoError_raiseAndReturnInt();
    if (!PyArg_ParseTupleAndKeywords(args, keywordArgs,
            "|OOOiKO!ppOiOssOOOpOOI", keywordList, &usernameObj, &passwordObj,
            &dsnObj, &dpiCreateParams.authMode, &externalHandle,
            &cxoPyTypeSessionPool, &pool, &threaded, &events, &cclassObj,
            &dpiCreateParams.purity, &newPasswordObj,
            &dpiCommonParams.encoding, &dpiCommonParams.nencoding, &editionObj,
            &contextObj, &tagObj, &dpiCreateParams.matchAnyTag,
            &shardingKeyObj, &superShardingKeyObj, &stmtCacheSize))
        return -1;
    dpiCreateParams.externalHandle = (void*) externalHandle;
    if (threaded)
        dpiCommonParams.createMode |= DPI_MODE_CREATE_THREADED;
    if (events)
        dpiCommonParams.createMode |= DPI_MODE_CREATE_EVENTS;

    // keep a copy of the user name and connect string (DSN)
    Py_XINCREF(usernameObj);
    conn->username = usernameObj;
    Py_XINCREF(dsnObj);
    conn->dsn = dsnObj;
    Py_XINCREF(passwordObj);

    // perform some parsing, if no password and DSN are provided but the user
    // name is provided
    if (conn->username && !passwordObj && !dsnObj) {
        if (cxoConnection_splitComponent(conn->username, "/", "find",
                &beforePartObj, &afterPartObj) < 0)
            return -1;
        if (beforePartObj) {
            Py_DECREF(conn->username);
            conn->username = beforePartObj;
            passwordObj = afterPartObj;
            if (cxoConnection_splitComponent(passwordObj, "@", "rfind",
                    &beforePartObj, &afterPartObj) < 0)
                return -1;
            if (beforePartObj) {
                Py_DECREF(passwordObj);
                passwordObj = beforePartObj;
                conn->dsn = afterPartObj;
            }
        }
    }

    // setup parameters
    cxoConnectionParams_initialize(&params);
    if (pool) {
        dpiCreateParams.pool = pool->handle;
        params.encoding = pool->encodingInfo.encoding;
        params.nencoding = pool->encodingInfo.nencoding;
    } else {
        params.encoding =
                cxoUtils_getAdjustedEncoding(dpiCommonParams.encoding);
        params.nencoding =
                cxoUtils_getAdjustedEncoding(dpiCommonParams.nencoding);
    }
    if (cxoConnectionParams_processContext(&params, contextObj) < 0)
        return cxoConnectionParams_finalize(&params);
    if (cxoConnectionParams_processShardingKey(&params, shardingKeyObj, 0) < 0)
        return cxoConnectionParams_finalize(&params);
    if (cxoConnectionParams_processShardingKey(&params, superShardingKeyObj,
            1) < 0)
        return cxoConnectionParams_finalize(&params);
    if (cxoBuffer_fromObject(&params.userNameBuffer, conn->username,
                    params.encoding) < 0 ||
            cxoBuffer_fromObject(&params.passwordBuffer, passwordObj,
                    params.encoding) < 0 ||
            cxoBuffer_fromObject(&params.dsnBuffer, conn->dsn,
                    params.encoding) < 0 ||
            cxoBuffer_fromObject(&params.connectionClassBuffer, cclassObj,
                    params.encoding) < 0 ||
            cxoBuffer_fromObject(&params.newPasswordBuffer, newPasswordObj,
                    params.encoding) < 0 ||
            cxoBuffer_fromObject(&params.editionBuffer, editionObj,
                    params.encoding) < 0 ||
            cxoBuffer_fromObject(&params.tagBuffer, tagObj,
                    params.encoding) < 0) {
        Py_XDECREF(passwordObj);
        return cxoConnectionParams_finalize(&params);
    }
    Py_XDECREF(passwordObj);
    if (params.userNameBuffer.size == 0 && params.passwordBuffer.size == 0)
        dpiCreateParams.externalAuth = 1;
    dpiCreateParams.connectionClass = params.connectionClassBuffer.ptr;
    dpiCreateParams.connectionClassLength = params.connectionClassBuffer.size;
    dpiCreateParams.newPassword = params.newPasswordBuffer.ptr;
    dpiCreateParams.newPasswordLength = params.newPasswordBuffer.size;
    dpiCommonParams.edition = params.editionBuffer.ptr;
    dpiCommonParams.editionLength = params.editionBuffer.size;
    dpiCommonParams.stmtCacheSize = stmtCacheSize;
    dpiCreateParams.tag = params.tagBuffer.ptr;
    dpiCreateParams.tagLength = params.tagBuffer.size;
    dpiCreateParams.appContext = params.appContext;
    dpiCreateParams.numAppContext = params.numAppContext;
    dpiCreateParams.shardingKeyColumns = params.shardingKeyColumns;
    dpiCreateParams.numShardingKeyColumns = params.numShardingKeyColumns;
    dpiCreateParams.superShardingKeyColumns = params.superShardingKeyColumns;
    dpiCreateParams.numSuperShardingKeyColumns =
            params.numSuperShardingKeyColumns;
    if (pool && !pool->homogeneous && pool->username && conn->username) {
        temp = PyObject_RichCompareBool(conn->username, pool->username, Py_EQ);
        if (temp < 0)
            return cxoConnectionParams_finalize(&params);
        if (temp)
            params.userNameBuffer.size = 0;
    }

    // create connection
    Py_BEGIN_ALLOW_THREADS
    status = dpiConn_create(cxoDpiContext, params.userNameBuffer.ptr,
            params.userNameBuffer.size, params.passwordBuffer.ptr,
            params.passwordBuffer.size, params.dsnBuffer.ptr,
            params.dsnBuffer.size, &dpiCommonParams, &dpiCreateParams,
            &conn->handle);
    Py_END_ALLOW_THREADS
    if (status < 0) {
        cxoConnectionParams_finalize(&params);
        return cxoError_raiseAndReturnInt();
    }

    // determine if session callback should be invoked; this takes place if
    // the connection is newly created by the pool or if the requested tag
    // does not match the actual tag
    invokeSessionCallback = 0;
    if (dpiCreateParams.outNewSession ||
            dpiCreateParams.outTagLength != params.tagBuffer.size ||
            (dpiCreateParams.outTagLength > 0 &&
            strncmp(dpiCreateParams.outTag, params.tagBuffer.ptr,
                    dpiCreateParams.outTagLength) != 0))
        invokeSessionCallback = 1;
    cxoConnectionParams_finalize(&params);

    // determine encodings to use
    if (pool)
        conn->encodingInfo = pool->encodingInfo;
    else {
        if (dpiConn_getEncodingInfo(conn->handle, &conn->encodingInfo) < 0)
            return cxoError_raiseAndReturnInt();
        conn->encodingInfo.encoding =
                cxoUtils_getAdjustedEncoding(conn->encodingInfo.encoding);
        conn->encodingInfo.nencoding =
                cxoUtils_getAdjustedEncoding(conn->encodingInfo.nencoding);
    }

    // set tag property
    if (dpiCreateParams.outTagLength > 0) {
        conn->tag = PyUnicode_Decode(dpiCreateParams.outTag,
                dpiCreateParams.outTagLength, conn->encodingInfo.encoding,
                NULL);
        if (!conn->tag)
            return -1;
    }

    // invoke the session callback if applicable
    if (invokeSessionCallback && pool && pool->sessionCallback &&
            PyCallable_Check(pool->sessionCallback)) {
        tempObj = PyObject_CallFunctionObjArgs(pool->sessionCallback,
                (PyObject*) conn, tagObj, NULL);
        if (!tempObj)
            return -1;
        Py_DECREF(tempObj);
    }

    return 0;
}


//-----------------------------------------------------------------------------
// cxoConnection_free()
//   Deallocate the connection, disconnecting from the database if necessary.
//-----------------------------------------------------------------------------
static void cxoConnection_free(cxoConnection *conn)
{
    if (conn->handle) {
        Py_BEGIN_ALLOW_THREADS
        dpiConn_release(conn->handle);
        Py_END_ALLOW_THREADS
        conn->handle = NULL;
    }
    Py_CLEAR(conn->sessionPool);
    Py_CLEAR(conn->username);
    Py_CLEAR(conn->dsn);
    Py_CLEAR(conn->version);
    Py_CLEAR(conn->inputTypeHandler);
    Py_CLEAR(conn->outputTypeHandler);
    Py_CLEAR(conn->tag);
    Py_TYPE(conn)->tp_free((PyObject*) conn);
}


//-----------------------------------------------------------------------------
// cxoConnection_repr()
//   Return a string representation of the connection.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_repr(cxoConnection *connection)
{
    PyObject *module, *name, *result;

    if (cxoUtils_getModuleAndName(Py_TYPE(connection), &module, &name) < 0)
        return NULL;
    if (connection->username && connection->username != Py_None &&
            connection->dsn && connection->dsn != Py_None) {
        result = cxoUtils_formatString("<%s.%s to %s@%s>",
                PyTuple_Pack(4, module, name, connection->username,
                        connection->dsn));
    } else if (connection->username && connection->username != Py_None) {
        result = cxoUtils_formatString("<%s.%s to user %s@local>",
                PyTuple_Pack(3, module, name, connection->username));
    } else {
        result = cxoUtils_formatString("<%s.%s to externally identified user>",
                PyTuple_Pack(2, module, name));
    }
    Py_DECREF(module);
    Py_DECREF(name);
    return result;
}


//-----------------------------------------------------------------------------
// cxoConnection_getStmtCacheSize()
//   Return the Oracle statement cache size.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_getStmtCacheSize(cxoConnection* conn, void* arg)
{
    uint32_t cacheSize;

    if (cxoConnection_isConnected(conn) < 0)
        return NULL;
    if (dpiConn_getStmtCacheSize(conn->handle, &cacheSize) < 0)
        return cxoError_raiseAndReturnNull();
    return PyLong_FromLong(cacheSize);
}


//-----------------------------------------------------------------------------
// cxoConnection_setStmtCacheSize()
//   Set the Oracle statement cache size.
//-----------------------------------------------------------------------------
static int cxoConnection_setStmtCacheSize(cxoConnection* conn, PyObject *value,
        void* arg)
{
    uint32_t cacheSize;

    if (cxoConnection_isConnected(conn) < 0)
        return -1;
    if (!PyLong_Check(value)) {
        PyErr_SetString(PyExc_TypeError, "value must be an integer");
        return -1;
    }
    cacheSize = (uint32_t) PyLong_AsLong(value);
    if (dpiConn_setStmtCacheSize(conn->handle, cacheSize) < 0)
        return cxoError_raiseAndReturnInt();
    return 0;
}


//-----------------------------------------------------------------------------
// cxoConnection_getCallTimeout()
//   Return the call timeout (in milliseconds) for round-trips performed with
// this connection.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_getCallTimeout(cxoConnection* conn, void* arg)
{
    uint32_t callTimeout;

    if (cxoConnection_isConnected(conn) < 0)
        return NULL;
    if (dpiConn_getCallTimeout(conn->handle, &callTimeout) < 0)
        return cxoError_raiseAndReturnNull();
    return PyLong_FromLong(callTimeout);
}


//-----------------------------------------------------------------------------
// cxoConnection_setCallTimeout()
//   Set the call timeout (in milliseconds) for round-trips performed with this
// connection.
//-----------------------------------------------------------------------------
static int cxoConnection_setCallTimeout(cxoConnection* conn, PyObject *value,
        void* arg)
{
    uint32_t callTimeout;

    if (cxoConnection_isConnected(conn) < 0)
        return -1;
    callTimeout = (uint32_t) PyLong_AsLong(value);
    if (PyErr_Occurred())
        return -1;
    if (dpiConn_setCallTimeout(conn->handle, callTimeout) < 0)
        return cxoError_raiseAndReturnInt();
    return 0;
}


//-----------------------------------------------------------------------------
// cxoConnection_getType()
//   Return a type object given its name.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_getType(cxoConnection *conn, PyObject *nameObj)
{
    if (cxoConnection_isConnected(conn) < 0)
        return NULL;
    return (PyObject*) cxoObjectType_newByName(conn, nameObj);
}


//-----------------------------------------------------------------------------
// cxoConnection_createLob()
//   Create a new temporary LOB and return it.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_createLob(cxoConnection *conn,
        PyObject *lobType)
{
    cxoDbType *dbType;
    dpiLob *handle;
    PyObject *lob;

    // verify connection is open
    if (cxoConnection_isConnected(conn) < 0)
        return NULL;

    // verify the LOB type
    if (lobType != (PyObject*) cxoDbTypeClob &&
            lobType != (PyObject*) cxoDbTypeBlob &&
            lobType != (PyObject*) cxoDbTypeNclob) {
        PyErr_SetString(PyExc_TypeError,
                "parameter should be one of cx_Oracle.DB_TYPE_CLOB, "
                "cx_Oracle.DB_TYPE_BLOB or cx_Oracle.DB_TYPE_NCLOB");
        return NULL;
    }

    // create a temporary LOB
    dbType = (cxoDbType*) lobType;
    if (dpiConn_newTempLob(conn->handle, dbType->num, &handle) < 0)
        return cxoError_raiseAndReturnNull();
    lob = cxoLob_new(conn, dbType, handle);
    if (!lob)
        dpiLob_release(handle);
    return lob;
}


//-----------------------------------------------------------------------------
// cxoConnection_getVersion()
//   Retrieve the version of the database and return it. Note that this
// function also places the result in the associated dictionary so it is only
// calculated once.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_getVersion(cxoConnection *conn, void *unused)
{
    dpiVersionInfo versionInfo;
    char buffer[25];
    int status, len;

    if (cxoConnection_isConnected(conn) < 0)
        return NULL;
    Py_BEGIN_ALLOW_THREADS
    status = dpiConn_getServerVersion(conn->handle, NULL, NULL, &versionInfo);
    Py_END_ALLOW_THREADS
    if (status < 0)
        return cxoError_raiseAndReturnNull();
    len = snprintf(buffer, sizeof(buffer), "%d.%d.%d.%d.%d",
            versionInfo.versionNum, versionInfo.releaseNum,
            versionInfo.updateNum, versionInfo.portReleaseNum,
            versionInfo.portUpdateNum);
    return PyUnicode_DecodeASCII(buffer, len, NULL);
}


//-----------------------------------------------------------------------------
// cxoConnection_getEncoding()
//   Return the encoding associated with the environment of the connection.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_getEncoding(cxoConnection *conn, void *unused)
{
    return PyUnicode_DecodeASCII(conn->encodingInfo.encoding,
            strlen(conn->encodingInfo.encoding), NULL);
}


//-----------------------------------------------------------------------------
// cxoConnection_getLTXID()
//   Return the logical transaction id used with Transaction Guard.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_getLTXID(cxoConnection *conn, void *unused)
{
    uint32_t ltxidLength;
    const char *ltxid;

    if (cxoConnection_isConnected(conn) < 0)
        return NULL;
    if (dpiConn_getLTXID(conn->handle, &ltxid, &ltxidLength) < 0)
        return cxoError_raiseAndReturnNull();
    return PyBytes_FromStringAndSize(ltxid, ltxidLength);
}


//-----------------------------------------------------------------------------
// cxoConnection_getHandle()
//   Return the OCI handle used by the connection.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_getHandle(cxoConnection *conn, void *unused)
{
    void *handle;

    if (cxoConnection_isConnected(conn) < 0)
        return NULL;
    if (dpiConn_getHandle(conn->handle, &handle) < 0)
        return cxoError_raiseAndReturnNull();
    return PyLong_FromUnsignedLongLong((unsigned long long) handle);
}


//-----------------------------------------------------------------------------
// cxoConnection_getNationalEncoding()
//   Return the national encoding associated with the environment of the
// connection.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_getNationalEncoding(cxoConnection *conn,
        void *unused)
{
    return PyUnicode_DecodeASCII(conn->encodingInfo.nencoding,
            strlen(conn->encodingInfo.nencoding), NULL);
}


//-----------------------------------------------------------------------------
// cxoConnection_getMaxBytesPerCharacter()
//   Return the maximum number of bytes per character.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_getMaxBytesPerCharacter(cxoConnection *conn,
        void *unused)
{
    return PyLong_FromLong(conn->encodingInfo.maxBytesPerCharacter);
}


//-----------------------------------------------------------------------------
// cxoConnection_close()
//   Close the connection, disconnecting from the database.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_close(cxoConnection *conn, PyObject *args)
{
    cxoBuffer tagBuffer;
    uint32_t mode;
    int status;

    if (cxoConnection_isConnected(conn) < 0)
        return NULL;
    if (cxoBuffer_fromObject(&tagBuffer, conn->tag,
            conn->encodingInfo.encoding) < 0)
        return NULL;
    mode = DPI_MODE_CONN_CLOSE_DEFAULT;
    if (conn->tag && conn->tag != Py_None)
        mode |= DPI_MODE_CONN_CLOSE_RETAG;
    Py_BEGIN_ALLOW_THREADS
    status = dpiConn_close(conn->handle, mode, (char*) tagBuffer.ptr,
            tagBuffer.size);
    if (status == DPI_SUCCESS)
        dpiConn_release(conn->handle);
    Py_END_ALLOW_THREADS
    cxoBuffer_clear(&tagBuffer);
    if (status < 0)
        return cxoError_raiseAndReturnNull();
    conn->handle = NULL;

    Py_RETURN_NONE;
}


//-----------------------------------------------------------------------------
// cxoConnection_commit()
//   Commit the transaction on the connection.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_commit(cxoConnection *conn, PyObject *args)
{
    int status;

    if (cxoConnection_isConnected(conn) < 0)
        return NULL;
    Py_BEGIN_ALLOW_THREADS
    status = dpiConn_commit(conn->handle);
    Py_END_ALLOW_THREADS
    if (status < 0)
        return cxoError_raiseAndReturnNull();

    Py_RETURN_NONE;
}


//-----------------------------------------------------------------------------
// cxoConnection_begin()
//   Begin a new transaction on the connection.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_begin(cxoConnection *conn, PyObject *args)
{
    Py_ssize_t transactionIdLength, branchIdLength;
    const char *transactionId, *branchId;
    int formatId, status;

    // parse the arguments
    formatId = -1;
    transactionId = branchId = NULL;
    transactionIdLength = branchIdLength = 0;
    if (!PyArg_ParseTuple(args, "|is#s#", &formatId, &transactionId,
            &transactionIdLength,  &branchId, &branchIdLength))
        return NULL;

    // make sure we are actually connected
    if (cxoConnection_isConnected(conn) < 0)
        return NULL;

    // begin the distributed transaction
    Py_BEGIN_ALLOW_THREADS
    status = dpiConn_beginDistribTrans(conn->handle, formatId, transactionId,
            transactionIdLength, branchId, branchIdLength);
    Py_END_ALLOW_THREADS
    if (status < 0)
        return cxoError_raiseAndReturnNull();

    Py_RETURN_NONE;
}


//-----------------------------------------------------------------------------
// cxoConnection_prepare()
//   Commit the transaction on the connection.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_prepare(cxoConnection *conn, PyObject *args)
{
    int status, commitNeeded;

    // make sure we are actually connected
    if (cxoConnection_isConnected(conn) < 0)
        return NULL;

    // perform the prepare
    Py_BEGIN_ALLOW_THREADS
    status = dpiConn_prepareDistribTrans(conn->handle, &commitNeeded);
    Py_END_ALLOW_THREADS
    if (status < 0)
        return cxoError_raiseAndReturnNull();

    // return whether a commit is needed in order to allow for avoiding the
    // call to commit() which will fail with ORA-24756 (transaction does not
    // exist)
    return PyBool_FromLong(commitNeeded);
}


//-----------------------------------------------------------------------------
// cxoConnection_rollback()
//   Rollback the transaction on the connection.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_rollback(cxoConnection *conn, PyObject *args)
{
    int status;

    if (cxoConnection_isConnected(conn) < 0)
        return NULL;
    Py_BEGIN_ALLOW_THREADS
    status = dpiConn_rollback(conn->handle);
    Py_END_ALLOW_THREADS
    if (status < 0)
        return cxoError_raiseAndReturnNull();

    Py_RETURN_NONE;
}


//-----------------------------------------------------------------------------
// cxoConnection_newCursor()
//   Create a new cursor (statement) referencing the connection.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_newCursor(cxoConnection *conn, PyObject *args,
        PyObject *keywordArgs)
{
    PyObject *createArgs, *result, *arg;
    Py_ssize_t numArgs = 0, i;

    if (cxoConnection_isConnected(conn) < 0)
        return NULL;
    if (args)
        numArgs = PyTuple_GET_SIZE(args);
    createArgs = PyTuple_New(1 + numArgs);
    if (!createArgs)
        return NULL;
    Py_INCREF(conn);
    PyTuple_SET_ITEM(createArgs, 0, (PyObject*) conn);
    for (i = 0; i < numArgs; i++) {
        arg = PyTuple_GET_ITEM(args, i);
        Py_INCREF(arg);
        PyTuple_SET_ITEM(createArgs, i + 1, arg);
    }
    result = PyObject_Call( (PyObject*) &cxoPyTypeCursor, createArgs,
            keywordArgs);
    Py_DECREF(createArgs);
    return result;
}


//-----------------------------------------------------------------------------
// cxoConnection_cancel()
//   Cause Oracle to issue an immediate (asynchronous) abort of any currently
// executing statement.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_cancel(cxoConnection *conn, PyObject *args)
{
    if (cxoConnection_isConnected(conn) < 0)
        return NULL;
    if (dpiConn_breakExecution(conn->handle) < 0)
        return cxoError_raiseAndReturnNull();

    Py_RETURN_NONE;
}


//-----------------------------------------------------------------------------
// cxoConnection_newEnqueueOptions()
//   Creates a new enqueue options object and returns it.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_newEnqueueOptions(cxoConnection *conn,
        PyObject *args)
{
    if (cxoConnection_isConnected(conn) < 0)
        return NULL;
    return (PyObject*) cxoEnqOptions_new(conn, NULL);
}


//-----------------------------------------------------------------------------
// cxoConnection_newDequeueOptions()
//   Creates a new dequeue options object and returns it.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_newDequeueOptions(cxoConnection *conn,
        PyObject *args)
{
    if (cxoConnection_isConnected(conn) < 0)
        return NULL;
    return (PyObject*) cxoDeqOptions_new(conn, NULL);
}


//-----------------------------------------------------------------------------
// cxoConnection_newMessageProperties()
//   Creates a new message properties object and returns it.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_newMessageProperties(cxoConnection *conn,
        PyObject *args, PyObject *keywordArgs)
{
    static char *keywordList[] = { "payload", "correlation", "delay",
            "exceptionq", "expiration", "priority", NULL };
    PyObject *payloadObj, *correlationObj, *exceptionQObj;
    int delay, expiration, priority, status;
    cxoMsgProps *props;
    cxoBuffer buffer;

    // parse arguments
    expiration = -1;
    delay = priority = 0;
    payloadObj = correlationObj = exceptionQObj = NULL;
    if (!PyArg_ParseTupleAndKeywords(args, keywordArgs, "|OOiOii", keywordList,
            &payloadObj, &correlationObj, &delay, &exceptionQObj, &expiration,
            &priority))
        return NULL;
    if (cxoConnection_isConnected(conn) < 0)
        return NULL;

    // create new message properties object
    props = cxoMsgProps_new(conn, NULL);
    if (!props)
        return NULL;

    // set payload, if applicable
    if (payloadObj) {
        Py_INCREF(payloadObj);
        props->payload = payloadObj;
    }

    // set correlation, if applicable
    if (correlationObj) {
        if (cxoBuffer_fromObject(&buffer, correlationObj,
                props->encoding) < 0) {
            Py_DECREF(props);
            return NULL;
        }
        status = dpiMsgProps_setCorrelation(props->handle, buffer.ptr,
                buffer.size);
        cxoBuffer_clear(&buffer);
        if (status < 0) {
            cxoError_raiseAndReturnNull();
            Py_DECREF(props);
            return NULL;
        }
    }

    // set delay, if applicable
    if (delay != 0) {
        if (dpiMsgProps_setDelay(props->handle, (int32_t) delay) < 0) {
            cxoError_raiseAndReturnNull();
            Py_DECREF(props);
            return NULL;
        }
    }

    // set exception queue, if applicable
    if (exceptionQObj) {
        if (cxoBuffer_fromObject(&buffer, exceptionQObj,
                props->encoding) < 0) {
            Py_DECREF(props);
            return NULL;
        }
        status = dpiMsgProps_setExceptionQ(props->handle, buffer.ptr,
                buffer.size);
        cxoBuffer_clear(&buffer);
        if (status < 0) {
            cxoError_raiseAndReturnNull();
            Py_DECREF(props);
            return NULL;
        }
    }

    // set expiration, if applicable
    if (expiration != -1) {
        if (dpiMsgProps_setExpiration(props->handle,
                (int32_t) expiration) < 0) {
            cxoError_raiseAndReturnNull();
            Py_DECREF(props);
            return NULL;
        }
    }

    // set priority, if applicable
    if (priority != 0) {
        if (dpiMsgProps_setPriority(props->handle, (int32_t) priority) < 0) {
            cxoError_raiseAndReturnNull();
            Py_DECREF(props);
            return NULL;
        }
    }

    return (PyObject*) props;
}


//-----------------------------------------------------------------------------
// cxoConnection_dequeue()
//   Dequeues a message using Advanced Queuing capabilities. The message ID is
// returned if a message is available or None if no message is available.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_dequeue(cxoConnection *conn, PyObject* args,
        PyObject* keywordArgs)
{
    static char *keywordList[] = { "name", "options", "msgproperties",
            "payload", NULL };
    cxoMsgProps *propertiesObj;
    const char *messageIdValue;
    cxoDeqOptions *optionsObj;
    uint32_t messageIdLength;
    cxoObject *payloadObj;
    cxoBuffer nameBuffer;
    PyObject *nameObj;
    int status;

    // parse arguments
    if (!PyArg_ParseTupleAndKeywords(args, keywordArgs, "OO!O!O!", keywordList,
            &nameObj, &cxoPyTypeDeqOptions, &optionsObj, &cxoPyTypeMsgProps,
            &propertiesObj, &cxoPyTypeObject, &payloadObj))
        return NULL;
    if (cxoConnection_isConnected(conn) < 0)
        return NULL;
    if (cxoBuffer_fromObject(&nameBuffer, nameObj,
            conn->encodingInfo.encoding) < 0)
        return NULL;

    // dequeue payload
    Py_BEGIN_ALLOW_THREADS
    status = dpiConn_deqObject(conn->handle, nameBuffer.ptr, nameBuffer.size,
            optionsObj->handle, propertiesObj->handle, payloadObj->handle,
            &messageIdValue, &messageIdLength);
    Py_END_ALLOW_THREADS
    cxoBuffer_clear(&nameBuffer);
    if (status < 0)
        return cxoError_raiseAndReturnNull();

    // return message id
    if (!messageIdValue)
        Py_RETURN_NONE;
    return PyBytes_FromStringAndSize(messageIdValue, messageIdLength);
}


//-----------------------------------------------------------------------------
// cxoConnection_enqueue()
//   Enqueues a message using Advanced Queuing capabilities. The message ID is
// returned.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_enqueue(cxoConnection *conn, PyObject* args,
        PyObject* keywordArgs)
{
    static char *keywordList[] = { "name", "options", "msgproperties",
            "payload", NULL };
    cxoMsgProps *propertiesObj;
    const char *messageIdValue;
    cxoEnqOptions *optionsObj;
    uint32_t messageIdLength;
    cxoObject *payloadObj;
    cxoBuffer nameBuffer;
    PyObject *nameObj;
    int status;

    // parse arguments
    if (!PyArg_ParseTupleAndKeywords(args, keywordArgs, "OO!O!O!", keywordList,
            &nameObj, &cxoPyTypeEnqOptions, &optionsObj, &cxoPyTypeMsgProps,
            &propertiesObj, &cxoPyTypeObject, &payloadObj))
        return NULL;
    if (cxoConnection_isConnected(conn) < 0)
        return NULL;
    if (cxoBuffer_fromObject(&nameBuffer, nameObj,
            conn->encodingInfo.encoding) < 0)
        return NULL;

    // enqueue payload
    Py_BEGIN_ALLOW_THREADS
    status = dpiConn_enqObject(conn->handle, nameBuffer.ptr, nameBuffer.size,
            optionsObj->handle, propertiesObj->handle, payloadObj->handle,
            &messageIdValue, &messageIdLength);
    Py_END_ALLOW_THREADS
    cxoBuffer_clear(&nameBuffer);
    if (status < 0)
        return cxoError_raiseAndReturnNull();

    // return message id
    return PyBytes_FromStringAndSize(messageIdValue, messageIdLength);
}


//-----------------------------------------------------------------------------
// cxoConnection_queue()
//   Creates a new queue associated with the connection and returns it to the
// caller.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_queue(cxoConnection *conn, PyObject* args,
        PyObject* keywordArgs)
{
    static char *keywordList[] = { "name", "payload_type", "payloadType",
            NULL };
    cxoObjectType *typeObj, *deprecatedTypeObj;
    cxoBuffer nameBuffer;
    PyObject *nameObj;
    dpiQueue *handle;
    cxoQueue *queue;
    int status;

    // parse arguments
    typeObj = deprecatedTypeObj = NULL;
    if (!PyArg_ParseTupleAndKeywords(args, keywordArgs, "O|O!O!", keywordList,
            &nameObj, &cxoPyTypeObjectType, &typeObj, &cxoPyTypeObjectType,
            &deprecatedTypeObj))
        return NULL;
    if (cxoConnection_isConnected(conn) < 0)
        return NULL;
    if (deprecatedTypeObj) {
        if (typeObj) {
            cxoError_raiseFromString(cxoProgrammingErrorException,
                    "payload_type and payloadType cannot both be specified");
            return NULL;
        }
        typeObj = deprecatedTypeObj;
    }
    if (cxoBuffer_fromObject(&nameBuffer, nameObj,
            conn->encodingInfo.encoding) < 0)
        return NULL;

    // create queue
    status = dpiConn_newQueue(conn->handle, nameBuffer.ptr, nameBuffer.size,
            (typeObj) ? typeObj->handle : NULL, &handle);
    cxoBuffer_clear(&nameBuffer);
    if (status < 0)
        return cxoError_raiseAndReturnNull();
    queue = cxoQueue_new(conn, handle);
    if (!queue)
        return NULL;
    Py_INCREF(nameObj);
    queue->name = nameObj;
    Py_XINCREF(typeObj);
    queue->payloadType = typeObj;

    return (PyObject*) queue;
}


//-----------------------------------------------------------------------------
// cxoConnection_contextManagerEnter()
//   Called when the connection is used as a context manager and simply returns
// itconn as a convenience to the caller.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_contextManagerEnter(cxoConnection *conn,
        PyObject* args)
{
    if (cxoConnection_isConnected(conn) < 0)
        return NULL;
    Py_INCREF(conn);
    return (PyObject*) conn;
}


//-----------------------------------------------------------------------------
// cxoConnection_contextManagerExit()
//   Called when the connection is used as a context manager and if any
// exception a rollback takes place; otherwise, a commit takes place.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_contextManagerExit(cxoConnection *conn,
        PyObject* args)
{
    PyObject *excType, *excValue, *excTraceback, *result;

    if (!PyArg_ParseTuple(args, "OOO", &excType, &excValue, &excTraceback))
        return NULL;
    result = cxoConnection_close(conn, NULL);
    if (!result)
        return NULL;
    Py_DECREF(result);

    Py_INCREF(Py_False);
    return Py_False;
}


//-----------------------------------------------------------------------------
// cxoConnection_ping()
//   Makes a round trip call to the server to confirm that the connection and
// server are active.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_ping(cxoConnection *conn, PyObject* args)
{
    int status;

    if (cxoConnection_isConnected(conn) < 0)
        return NULL;
    Py_BEGIN_ALLOW_THREADS
    status = dpiConn_ping(conn->handle);
    Py_END_ALLOW_THREADS
    if (status < 0)
        return cxoError_raiseAndReturnNull();

    Py_RETURN_NONE;
}


//-----------------------------------------------------------------------------
// cxoConnection_shutdown()
//   Shuts down the database. Note that this must be done in two phases except
// in the situation where the instance is aborted.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_shutdown(cxoConnection *conn, PyObject* args,
        PyObject* keywordArgs)
{
    static char *keywordList[] = { "mode", NULL };
    dpiShutdownMode mode;

    // parse arguments
    mode = DPI_MODE_SHUTDOWN_DEFAULT;
    if (!PyArg_ParseTupleAndKeywords(args, keywordArgs, "|i", keywordList,
            &mode))
        return NULL;

    // make sure we are actually connected
    if (cxoConnection_isConnected(conn) < 0)
        return NULL;

    // perform the work
    if (dpiConn_shutdownDatabase(conn->handle, mode) < 0)
        return cxoError_raiseAndReturnNull();

    Py_RETURN_NONE;
}


//-----------------------------------------------------------------------------
// cxoConnection_startup()
//   Starts up the database, equivalent to "startup nomount" in SQL*Plus.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_startup(cxoConnection *conn, PyObject* args,
        PyObject* keywordArgs)
{
    static char *keywordList[] = { "force", "restrict", "pfile", NULL };
    int temp, force, restrictStartup;
    cxoBuffer pfileBuffer;
    dpiStartupMode mode;
    PyObject *pfileObj;

    // parse arguments
    pfileObj = NULL;
    if (!PyArg_ParseTupleAndKeywords(args, keywordArgs, "|ppO", keywordList,
            &force, &restrictStartup, &pfileObj))
        return NULL;

    // set the flags to use during startup
    mode = DPI_MODE_STARTUP_DEFAULT;
    if (force)
        mode |= DPI_MODE_STARTUP_FORCE;
    if (restrictStartup)
        mode |= DPI_MODE_STARTUP_RESTRICT;

    // check the pfile parameter
    if (cxoBuffer_fromObject(&pfileBuffer, pfileObj,
            conn->encodingInfo.encoding) < 0)
        return NULL;

    // make sure we are actually connected
    if (cxoConnection_isConnected(conn) < 0) {
        cxoBuffer_clear(&pfileBuffer);
        return NULL;
    }

    // perform the work
    temp = dpiConn_startupDatabaseWithPfile(conn->handle, pfileBuffer.ptr,
            pfileBuffer.size, mode);
    cxoBuffer_clear(&pfileBuffer);
    if (temp < 0)
        return cxoError_raiseAndReturnNull();

    Py_RETURN_NONE;
}


//-----------------------------------------------------------------------------
// cxoConnection_subscribe()
//   Create a subscription to events that take place in the database.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_subscribe(cxoConnection *conn, PyObject* args,
        PyObject* keywordArgs)
{
    static char *keywordList[] = { "namespace", "protocol", "callback",
            "timeout", "operations", "port", "qos", "ip_address",
            "grouping_class", "grouping_value", "grouping_type", "name",
            "client_initiated", "ipAddress", "groupingClass", "groupingValue",
            "groupingType", "clientInitiated", NULL };
    PyObject *callback, *ipAddress, *ipAddressDeprecated, *name;
    uint8_t groupingClassDeprecated, groupingTypeDeprecated;
    cxoBuffer ipAddressBuffer, nameBuffer;
    uint32_t groupingValueDeprecated;
    int clientInitiatedDeprecated;
    dpiSubscrCreateParams params;
    cxoSubscr *subscr;

    // get default values for subscription parameters
    if (dpiContext_initSubscrCreateParams(cxoDpiContext, &params) < 0)
        return cxoError_raiseAndReturnNull();

    // validate parameters
    groupingValueDeprecated = 0;
    clientInitiatedDeprecated = 0;
    groupingClassDeprecated = groupingTypeDeprecated = 0;
    callback = name = ipAddress = ipAddressDeprecated = NULL;
    if (!PyArg_ParseTupleAndKeywords(args, keywordArgs, "|IIOIIIIObIbOpObIbp",
            keywordList, &params.subscrNamespace, &params.protocol, &callback,
            &params.timeout, &params.operations, &params.portNumber,
            &params.qos, &ipAddress, &params.groupingClass,
            &params.groupingValue, &params.groupingType, &name,
            &params.clientInitiated, &ipAddressDeprecated,
            &groupingClassDeprecated, &groupingValueDeprecated,
            &groupingTypeDeprecated, &clientInitiatedDeprecated))
        return NULL;
    if (cxoConnection_isConnected(conn) < 0)
        return NULL;

    // check duplicate parameters to ensure that both are not specified
    if (ipAddressDeprecated) {
        if (ipAddress) {
            cxoError_raiseFromString(cxoProgrammingErrorException,
                    "ip_address and ipAddress cannot both be specified");
            return NULL;
        }
        ipAddress = ipAddressDeprecated;
    }
    if (groupingClassDeprecated != 0) {
        if (params.groupingClass != 0) {
            cxoError_raiseFromString(cxoProgrammingErrorException,
                    "grouping_class and groupingClass cannot both be "
                    "specified");
            return NULL;
        }
        params.groupingClass = groupingClassDeprecated;
    }
    if (groupingValueDeprecated != 0) {
        if (params.groupingValue != 0) {
            cxoError_raiseFromString(cxoProgrammingErrorException,
                    "grouping_value and groupingValue cannot both be "
                    "specified");
            return NULL;
        }
        params.groupingValue = groupingValueDeprecated;
    }
    if (groupingTypeDeprecated != 0) {
        if (params.groupingType != 0) {
            cxoError_raiseFromString(cxoProgrammingErrorException,
                    "grouping_type and groupingType cannot both be "
                    "specified");
            return NULL;
        }
        params.groupingType = groupingTypeDeprecated;
    }
    if (clientInitiatedDeprecated != 0) {
        if (params.clientInitiated != 0) {
            cxoError_raiseFromString(cxoProgrammingErrorException,
                    "client_initiated and clientInitiated cannot both be "
                    "specified");
            return NULL;
        }
        params.clientInitiated = clientInitiatedDeprecated;
    }

    // populate IP address in parameters, if applicable
    cxoBuffer_init(&ipAddressBuffer);
    if (ipAddress) {
        if (cxoBuffer_fromObject(&ipAddressBuffer, ipAddress,
                conn->encodingInfo.encoding) < 0)
            return NULL;
        params.ipAddress = ipAddressBuffer.ptr;
        params.ipAddressLength = ipAddressBuffer.size;
    }

    // populate name in parameters, if applicable
    cxoBuffer_init(&nameBuffer);
    if (name) {
        if (cxoBuffer_fromObject(&nameBuffer, name,
                conn->encodingInfo.encoding) < 0) {
            cxoBuffer_clear(&ipAddressBuffer);
            return NULL;
        }
        params.name = nameBuffer.ptr;
        params.nameLength = nameBuffer.size;
    }

    // create Python subscription object
    subscr = (cxoSubscr*) cxoPyTypeSubscr.tp_alloc(&cxoPyTypeSubscr, 0);
    if (!subscr) {
        cxoBuffer_clear(&ipAddressBuffer);
        cxoBuffer_clear(&nameBuffer);
        return NULL;
    }
    Py_INCREF(conn);
    subscr->connection = conn;
    Py_XINCREF(callback);
    subscr->callback = callback;
    subscr->namespace = params.subscrNamespace;
    subscr->protocol = params.protocol;
    Py_XINCREF(ipAddress);
    subscr->ipAddress = ipAddress;
    Py_XINCREF(name);
    subscr->name = name;
    subscr->port = params.portNumber;
    subscr->timeout = params.timeout;
    subscr->operations = params.operations;
    subscr->qos = params.qos;
    subscr->groupingClass = params.groupingClass;
    subscr->groupingValue = params.groupingValue;
    subscr->groupingType = params.groupingType;

    // populate callback in parameters, if applicable
    if (callback) {
        params.callback = (dpiSubscrCallback) cxoSubscr_callback;
        params.callbackContext = subscr;
    }

    // create ODPI-C subscription
    if (dpiConn_subscribe(conn->handle, &params, &subscr->handle) < 0) {
        cxoError_raiseAndReturnNull();
        cxoBuffer_clear(&ipAddressBuffer);
        cxoBuffer_clear(&nameBuffer);
        Py_DECREF(subscr);
        return NULL;
    }
    subscr->id = params.outRegId;
    cxoBuffer_clear(&ipAddressBuffer);
    cxoBuffer_clear(&nameBuffer);

    return (PyObject*) subscr;
}


//-----------------------------------------------------------------------------
// cxoConnection_unsubscribe()
//   Destroy a subscription to events that take place in the database.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_unsubscribe(cxoConnection *conn, PyObject* args,
        PyObject* keywordArgs)
{
    static char *keywordList[] = { "subscription", NULL };
    PyObject *subscrObj;
    cxoSubscr *subscr;
    int status;

    // validate parameters
    if (!PyArg_ParseTupleAndKeywords(args, keywordArgs, "O!", keywordList,
            &cxoPyTypeSubscr, &subscrObj))
        return NULL;
    if (cxoConnection_isConnected(conn) < 0)
        return NULL;

    // destroy ODPI-C subscription
    subscr = (cxoSubscr*) subscrObj;
    Py_BEGIN_ALLOW_THREADS
    status = dpiConn_unsubscribe(conn->handle, subscr->handle);
    Py_END_ALLOW_THREADS
    if (status < 0)
        return cxoError_raiseAndReturnNull();
    subscr->handle = NULL;

    Py_RETURN_NONE;
}


//-----------------------------------------------------------------------------
// cxoConnection_getSodaDatabase()
//   Create and return a new SODA database object associated with the
// connection.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_getSodaDatabase(cxoConnection *conn,
        PyObject *args)
{
    if (cxoConnection_isConnected(conn) < 0)
        return NULL;
    return (PyObject*) cxoSodaDatabase_new(conn);
}


//-----------------------------------------------------------------------------
// cxoConnection_getOciAttr()
//   Return the value of the OCI attribute. This is intended to be used for
// testing attributes which are not currently exposed directly and should only
// be used for that purpose.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_getOciAttr(cxoConnection *conn, PyObject *args,
        PyObject *keywordArgs)
{
    static char *keywordList[] = { "handle_type", "attr_num", "attr_type",
            NULL };
    unsigned handleType, attrNum, attrType;
    uint32_t valueLength;
    dpiDataBuffer value;

    // validate parameters
    if (!PyArg_ParseTupleAndKeywords(args, keywordArgs, "III", keywordList,
            &handleType, &attrNum, &attrType))
        return NULL;
    if (cxoConnection_isConnected(conn) < 0)
        return NULL;

    // get value and convert it to the appropriate Python value
    if (dpiConn_getOciAttr(conn->handle, handleType, attrNum, &value,
            &valueLength) < 0)
        return cxoError_raiseAndReturnNull();
    return cxoUtils_convertOciAttrToPythonValue(attrType, &value, valueLength,
            conn->encodingInfo.encoding);
}


//-----------------------------------------------------------------------------
// cxoConnection_getCurrentSchema()
//   Return the current schema associated with the connection.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_getCurrentSchema(cxoConnection* conn,
        void* unused)
{
    return cxoConnection_getAttrText(conn, dpiConn_getCurrentSchema);
}


//-----------------------------------------------------------------------------
// cxoConnection_getEdition()
//   Return the edition associated with the connection.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_getEdition(cxoConnection* conn, void* unused)
{
    return cxoConnection_getAttrText(conn, dpiConn_getEdition);
}


//-----------------------------------------------------------------------------
// cxoConnection_getExternalName()
//   Return the external name associated with the connection.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_getExternalName(cxoConnection* conn,
        void* unused)
{
    return cxoConnection_getAttrText(conn, dpiConn_getExternalName);
}


//-----------------------------------------------------------------------------
// cxoConnection_getInternalName()
//   Return the internal name associated with the connection.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_getInternalName(cxoConnection* conn,
        void* unused)
{
    return cxoConnection_getAttrText(conn, dpiConn_getInternalName);
}


//-----------------------------------------------------------------------------
// cxoConnection_getException()
//   Return the requested exception.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_getException(cxoConnection *conn, void *arg)
{
    PyObject *exc = * (PyObject**) arg;

    Py_INCREF(exc);
    return exc;
}


//-----------------------------------------------------------------------------
// cxoConnection_setAction()
//   Set the action associated with the connection.
//-----------------------------------------------------------------------------
static int cxoConnection_setAction(cxoConnection* conn, PyObject *value,
        void* unused)
{
    return cxoConnection_setAttrText(conn, value, dpiConn_setAction);
}


//-----------------------------------------------------------------------------
// cxoConnection_setClientIdentifier()
//   Set the client identifier associated with the connection.
//-----------------------------------------------------------------------------
static int cxoConnection_setClientIdentifier(cxoConnection* conn,
        PyObject *value, void* unused)
{
    return cxoConnection_setAttrText(conn, value, dpiConn_setClientIdentifier);
}


//-----------------------------------------------------------------------------
// cxoConnection_setClientInfo()
//   Set the client info associated with the connection.
//-----------------------------------------------------------------------------
static int cxoConnection_setClientInfo(cxoConnection* conn, PyObject *value,
        void* unused)
{
    return cxoConnection_setAttrText(conn, value, dpiConn_setClientInfo);
}


//-----------------------------------------------------------------------------
// cxoConnection_setCurrentSchema()
//   Set the current schema associated with the connection.
//-----------------------------------------------------------------------------
static int cxoConnection_setCurrentSchema(cxoConnection* conn, PyObject *value,
        void* unused)
{
    return cxoConnection_setAttrText(conn, value, dpiConn_setCurrentSchema);
}


//-----------------------------------------------------------------------------
// cxoConnection_setDbOp()
//   Set the database operation associated with the connection.
//-----------------------------------------------------------------------------
static int cxoConnection_setDbOp(cxoConnection* conn, PyObject *value,
        void* unused)
{
    return cxoConnection_setAttrText(conn, value, dpiConn_setDbOp);
}


//-----------------------------------------------------------------------------
// cxoConnection_setExternalName()
//   Set the external name associated with the connection.
//-----------------------------------------------------------------------------
static int cxoConnection_setExternalName(cxoConnection* conn, PyObject *value,
        void* unused)
{
    return cxoConnection_setAttrText(conn, value, dpiConn_setExternalName);
}


//-----------------------------------------------------------------------------
// cxoConnection_setInternalName()
//   Set the internal name associated with the connection.
//-----------------------------------------------------------------------------
static int cxoConnection_setInternalName(cxoConnection* conn, PyObject *value,
        void* unused)
{
    return cxoConnection_setAttrText(conn, value, dpiConn_setInternalName);
}


//-----------------------------------------------------------------------------
// cxoConnection_setModule()
//   Set the module associated with the connection.
//-----------------------------------------------------------------------------
static int cxoConnection_setModule(cxoConnection* conn, PyObject *value,
        void* unused)
{
    return cxoConnection_setAttrText(conn, value, dpiConn_setModule);
}


//-----------------------------------------------------------------------------
// cxoConnection_setOciAttr()
//   Set the value of the OCI attribute to the specified value. This is
// intended to be used for testing attributes which are not currently exposed
// directly and should only be used for that purpose.
//-----------------------------------------------------------------------------
static PyObject *cxoConnection_setOciAttr(cxoConnection *conn, PyObject *args,
        PyObject *keywordArgs)
{
    static char *keywordList[] = { "handle_type", "attr_num", "attr_type",
            "value", NULL };
    unsigned handleType, attrNum, attrType;
    uint32_t ociValueLength;
    dpiDataBuffer ociBuffer;
    cxoBuffer buffer;
    PyObject *value;
    void *ociValue;

    // validate parameters
    if (!PyArg_ParseTupleAndKeywords(args, keywordArgs, "IIIO", keywordList,
            &handleType, &attrNum, &attrType, &value))
        return NULL;
    if (cxoConnection_isConnected(conn) < 0)
        return NULL;

    // convert value to OCI requirement and then set it
    cxoBuffer_init(&buffer);
    if (cxoUtils_convertPythonValueToOciAttr(value, attrType, &buffer,
            &ociBuffer, &ociValue, &ociValueLength,
            conn->encodingInfo.encoding) < 0)
        return NULL;
    if (dpiConn_setOciAttr(conn->handle, handleType, attrNum, ociValue,
            ociValueLength) < 0)
        return cxoError_raiseAndReturnNull();
    cxoBuffer_clear(&buffer);

    Py_RETURN_NONE;
}


//-----------------------------------------------------------------------------
// declaration of methods for the Python type
//-----------------------------------------------------------------------------
static PyMethodDef cxoMethods[] = {
    { "cursor", (PyCFunction) cxoConnection_newCursor,
            METH_VARARGS | METH_KEYWORDS },
    { "commit", (PyCFunction) cxoConnection_commit, METH_NOARGS },
    { "rollback", (PyCFunction) cxoConnection_rollback, METH_NOARGS },
    { "begin", (PyCFunction) cxoConnection_begin, METH_VARARGS },
    { "prepare", (PyCFunction) cxoConnection_prepare, METH_NOARGS },
    { "close", (PyCFunction) cxoConnection_close, METH_NOARGS },
    { "cancel", (PyCFunction) cxoConnection_cancel, METH_NOARGS },
    { "__enter__", (PyCFunction) cxoConnection_contextManagerEnter,
            METH_NOARGS },
    { "__exit__", (PyCFunction) cxoConnection_contextManagerExit,
            METH_VARARGS },
    { "ping", (PyCFunction) cxoConnection_ping, METH_NOARGS },
    { "shutdown", (PyCFunction) cxoConnection_shutdown,
            METH_VARARGS | METH_KEYWORDS},
    { "startup", (PyCFunction) cxoConnection_startup,
            METH_VARARGS | METH_KEYWORDS},
    { "subscribe", (PyCFunction) cxoConnection_subscribe,
            METH_VARARGS | METH_KEYWORDS},
    { "unsubscribe", (PyCFunction) cxoConnection_unsubscribe,
            METH_VARARGS | METH_KEYWORDS},
    { "changepassword", (PyCFunction) cxoConnection_changePassword,
            METH_VARARGS },
    { "gettype", (PyCFunction) cxoConnection_getType, METH_O },
    { "deqoptions", (PyCFunction) cxoConnection_newDequeueOptions,
            METH_NOARGS },
    { "enqoptions", (PyCFunction) cxoConnection_newEnqueueOptions,
            METH_NOARGS },
    { "msgproperties", (PyCFunction) cxoConnection_newMessageProperties,
            METH_VARARGS | METH_KEYWORDS },
    { "deq", (PyCFunction) cxoConnection_dequeue,
            METH_VARARGS | METH_KEYWORDS },
    { "enq", (PyCFunction) cxoConnection_enqueue,
            METH_VARARGS | METH_KEYWORDS },
    { "queue", (PyCFunction) cxoConnection_queue,
            METH_VARARGS | METH_KEYWORDS },
    { "createlob", (PyCFunction) cxoConnection_createLob, METH_O },
    { "getSodaDatabase", (PyCFunction) cxoConnection_getSodaDatabase,
            METH_NOARGS },
    { "_get_oci_attr", (PyCFunction) cxoConnection_getOciAttr,
            METH_VARARGS | METH_KEYWORDS },
    { "_set_oci_attr", (PyCFunction) cxoConnection_setOciAttr,
            METH_VARARGS | METH_KEYWORDS },
    { NULL }
};


//-----------------------------------------------------------------------------
// declaration of members for the Python type
//-----------------------------------------------------------------------------
static PyMemberDef cxoMembers[] = {
    { "username", T_OBJECT, offsetof(cxoConnection, username), READONLY },
    { "dsn", T_OBJECT, offsetof(cxoConnection, dsn), READONLY },
    { "tnsentry", T_OBJECT, offsetof(cxoConnection, dsn), READONLY },
    { "tag", T_OBJECT, offsetof(cxoConnection, tag), 0 },
    { "autocommit", T_INT, offsetof(cxoConnection, autocommit), 0 },
    { "inputtypehandler", T_OBJECT,
            offsetof(cxoConnection, inputTypeHandler), 0 },
    { "outputtypehandler", T_OBJECT,
            offsetof(cxoConnection, outputTypeHandler), 0 },
    { NULL }
};


//-----------------------------------------------------------------------------
// declaration of calculated members for the Python type
//-----------------------------------------------------------------------------
static PyGetSetDef cxoCalcMembers[] = {
    { "version", (getter) cxoConnection_getVersion, 0, 0, 0 },
    { "encoding", (getter) cxoConnection_getEncoding, 0, 0, 0 },
    { "nencoding", (getter) cxoConnection_getNationalEncoding, 0, 0, 0 },
    { "call_timeout", (getter) cxoConnection_getCallTimeout,
            (setter) cxoConnection_setCallTimeout, 0, 0 },
    { "maxBytesPerCharacter", (getter) cxoConnection_getMaxBytesPerCharacter,
            0, 0, 0 },
    { "stmtcachesize", (getter) cxoConnection_getStmtCacheSize,
            (setter) cxoConnection_setStmtCacheSize, 0, 0 },
    { "module", 0, (setter) cxoConnection_setModule, 0, 0 },
    { "action", 0, (setter) cxoConnection_setAction, 0, 0 },
    { "clientinfo", 0, (setter) cxoConnection_setClientInfo, 0, 0 },
    { "client_identifier", 0, (setter) cxoConnection_setClientIdentifier, 0,
            0 },
    { "current_schema", (getter) cxoConnection_getCurrentSchema,
            (setter) cxoConnection_setCurrentSchema, 0, 0 },
    { "external_name", (getter) cxoConnection_getExternalName,
            (setter) cxoConnection_setExternalName, 0, 0 },
    { "internal_name", (getter) cxoConnection_getInternalName,
            (setter) cxoConnection_setInternalName, 0, 0 },
    { "dbop", 0, (setter) cxoConnection_setDbOp, 0, 0 },
    { "edition", (getter) cxoConnection_getEdition, 0, 0, 0 },
    { "ltxid", (getter) cxoConnection_getLTXID, 0, 0, 0 },
    { "handle", (getter) cxoConnection_getHandle, 0, 0, 0 },
    { "Error", (getter) cxoConnection_getException, NULL, NULL,
            &cxoErrorException },
    { "Warning", (getter) cxoConnection_getException, NULL, NULL,
            &cxoWarningException },
    { "InterfaceError", (getter) cxoConnection_getException, NULL, NULL,
            &cxoInterfaceErrorException },
    { "DatabaseError", (getter) cxoConnection_getException, NULL, NULL,
            &cxoDatabaseErrorException },
    { "InternalError", (getter) cxoConnection_getException, NULL, NULL,
            &cxoInternalErrorException },
    { "OperationalError", (getter) cxoConnection_getException, NULL, NULL,
            &cxoOperationalErrorException },
    { "ProgrammingError", (getter) cxoConnection_getException, NULL, NULL,
            &cxoProgrammingErrorException },
    { "IntegrityError", (getter) cxoConnection_getException, NULL, NULL,
            &cxoIntegrityErrorException },
    { "DataError", (getter) cxoConnection_getException, NULL, NULL,
            &cxoDataErrorException },
    { "NotSupportedError", (getter) cxoConnection_getException, NULL, NULL,
            &cxoNotSupportedErrorException },
    { "callTimeout", (getter) cxoConnection_getCallTimeout,
            (setter) cxoConnection_setCallTimeout, 0, 0 },
    { NULL }
};


//-----------------------------------------------------------------------------
// declaration of the Python type
//-----------------------------------------------------------------------------
PyTypeObject cxoPyTypeConnection = {
    PyVarObject_HEAD_INIT(NULL, 0)
    .tp_name = "cx_Oracle.Connection",
    .tp_basicsize = sizeof(cxoConnection),
    .tp_dealloc = (destructor) cxoConnection_free,
    .tp_repr = (reprfunc) cxoConnection_repr,
    .tp_flags = Py_TPFLAGS_DEFAULT | Py_TPFLAGS_BASETYPE,
    .tp_methods = cxoMethods,
    .tp_members = cxoMembers,
    .tp_getset = cxoCalcMembers,
    .tp_init = (initproc) cxoConnection_init,
    .tp_new = (newfunc) cxoConnection_new
};
