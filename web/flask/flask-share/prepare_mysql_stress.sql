USE STRESS_TEST;


SET @n_col = 10;


DROP PROCEDURE IF EXISTS drop_stress_table;
DELIMITER $$
CREATE PROCEDURE drop_stress_table(IN n_row INT)
BEGIN
    SET @tbl_id = CONCAT('r', n_row, '_c', @n_col);
    SET @tbl    = CONCAT('table_', @tbl_id);
    SET @sql_drop_text = CONCAT('DROP TABLE IF EXISTS ', @tbl);

    PREPARE stmt FROM @sql_drop_text;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END$$
DELIMITER ;


DROP PROCEDURE IF EXISTS create_stress_table;
DELIMITER $$
CREATE PROCEDURE create_stress_table(IN n_row INT)
BEGIN
    SET @tbl_id = CONCAT('r', n_row, '_c', @n_col);
    SET @tbl    = CONCAT('table_', @tbl_id);
    SET @sql_create_text = CONCAT(
            'CREATE TABLE ', @tbl, ' (id int NOT NULL PRIMARY KEY, ',
            'col_', @tbl_id, '_1 VARCHAR(20), ',
            'col_', @tbl_id, '_2 VARCHAR(20), ',
            'col_', @tbl_id, '_3 VARCHAR(20), ',
            'col_', @tbl_id, '_4 VARCHAR(20), ',
            'col_', @tbl_id, '_5 VARCHAR(20), ',
            'col_', @tbl_id, '_6 VARCHAR(20), ',
            'col_', @tbl_id, '_7 VARCHAR(20), ',
            'col_', @tbl_id, '_8 VARCHAR(20), ',
            'col_', @tbl_id, '_9 VARCHAR(20));'
    );

    PREPARE stmt FROM @sql_create_text;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END$$
DELIMITER ;


DROP PROCEDURE IF EXISTS fill_stress_table;
DELIMITER $$
CREATE PROCEDURE fill_stress_table(IN n_row INT)
BEGIN
    DECLARE i INT DEFAULT 0;

    SET @tbl_id = CONCAT('r', n_row, '_c', @n_col);
    SET @tbl    = CONCAT('table_', @tbl_id);

    WHILE i < n_row DO
        SET @sql_insert_text = CONCAT(
                'INSERT INTO ', @tbl, ' (id, ',
                'col_', @tbl_id, '_1, ',
                'col_', @tbl_id, '_2, ',
                'col_', @tbl_id, '_3, ',
                'col_', @tbl_id, '_4, ',
                'col_', @tbl_id, '_5, ',
                'col_', @tbl_id, '_6, ',
                'col_', @tbl_id, '_7, ',
                'col_', @tbl_id, '_8, ',
                'col_', @tbl_id, '_9) ',
                'VALUES (', i, ' , rand() * 10000, rand() * 10000, rand() * 10000, rand() * 10000, rand() * 10000, rand() * 10000, rand() * 10000, rand() * 10000, rand() * 10000);'
        );
        PREPARE stmt FROM @sql_insert_text;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SET i = i + 1;
    END WHILE;
END$$
DELIMITER ;


DROP PROCEDURE IF EXISTS generate_tables;
DELIMITER $$
CREATE PROCEDURE generate_tables()
BEGIN
    DECLARE i INT DEFAULT 10;

    WHILE i <= 8192*10 DO
        CALL drop_stress_table(i);
        CALL create_stress_table(i);
        CALL fill_stress_table(i);
        SET i = i * 2;
    END WHILE;
END$$
DELIMITER ;

CALL generate_tables();