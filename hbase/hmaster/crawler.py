import requests
from bs4 import BeautifulSoup
from time import sleep
import sys
import smtplib
import os

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

mail_from = os.environ['MAIL_FROM']
pwd = os.environ['PASSWARD']
mail_to = os.environ['MAIL_TO']
region_limit = int(os.environ['REGION_LIMIT'])
polling_interval = int(os.environ['POLLING_INTERVAL'])


#hbase-master


def main():
    content = MIMEMultipart()  # 建立MIMEMultipart物件
    content["subject"] = "[Warning] Region server may over load"  # 郵件標題
    content["from"] = mail_from # 寄件者
    content["to"] = mail_to  # 收件者
    content.attach(MIMEText("The number of region is about to exceed the threshold !"))  # 郵件純文字內容
    print('Waiting for hbase clusrt up.')
    sleep(120) # wait for hbase culster up.
    while True:
        print('Getting region number.')
        r = requests.get("http://"+'hbase-master'+":16010/master-status#baseStats", timeout = 30) #將網頁資料GET下來
        soup = BeautifulSoup(r.text,"html.parser") #將網頁資料以html.parser

        #list total region num
        rows = soup.find_all('table', {'class':'tablesorter table table-striped'})[0].find_all('tr')[-1].find_all('td')
        region_num = int(rows[-1].text)
        #print(rows[-1].text)
        print('Get the region number successfully.')
        print('Check if the number is exceed the threshold.')
        if region_num > region_limit :
            print('The number is exceed.')
            with smtplib.SMTP(host="smtp.gmail.com", port="587") as smtp:  # 設定SMTP伺服器
                try:
                    print("Sending an Email...")
                    smtp.ehlo()  # 驗證SMTP伺服器
                    smtp.starttls()  # 建立加密傳輸
                    smtp.login(mail_from, pwd)  # 登入寄件者gmail
                    smtp.send_message(content)  # 寄送郵件
                    print("Complete!")
                except Exception as e:
                    print("Error message: ", e)
            print('The number is not exceed. Wait for the next round.')
        sleep(polling_interval)

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('Interrupted')
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)
