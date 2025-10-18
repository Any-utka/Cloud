# Тема: Виртуальные сети в AWS

>> Подготовила: Доцен Анна

---

## Цель работы: Научиться вручную создавать виртуальную сеть (VPC) в AWS, добавлять в неё подсети, таблицы маршрутов, интернет-шлюз (IGW) и NAT Gateway, а также настраивать взаимодействие между веб-сервером в публичной подсети и сервером базы данных в приватной

---

### Этапы выполнения

1) Подготовка среды
   - Входим в AWS Management Console
   - Проверяем регион (Frankfurt (eu-central-1))
   - Открываем VPC консоль
2) Создание VPC
   - В левой панели выбераем ```Your VPCs → Create VPC```
   - Указываем:
        - Name tag: ```student-vpc-k11```
        - IPv4 CIDR block: ```10.11.0.0/16```
        - Tenancy: ```Default```
        - Нажимаем ```Create VPC```  

        ![Img-1](https://imgur.com/9j5t0js.jpg)  

        ![Img-2](https://imgur.com/baLSyGA.jpg)

        ![Img-3](https://imgur.com/QJdx6wM.jpg)

        ![Img-4](https://imgur.com/cxl7pjh.jpg)
3) Создание Internet Gateway (IGW)
   - В левой панели выбераем ```Internet Gateways → Create internet gateway```
   - Указываем имя: ```student-igw-k11```
   - Теперь нужно “прикрепить” (Attach) шлюз к созданной сети:
        - Выбераем созданный ```IGW```
        - Нажимаем ```Actions → Attach to VPC```
        - В списке выбераем ```student-vpc-k11```
        - Подтверждаем действие

        ![Img-5](https://imgur.com/9eyGu3c.jpg)

        ![Img-6](https://imgur.com/A3aYCc0.jpg)

        ![Img-7](https://imgur.com/hranyCU.jpg)  
4) Создание подсетей
   4.1. Создание публичной подсети:
   - В левой панели выбераем ```Subnets → Create subnet```
   - Указываем:
        - VPC ID: выбераем созданную сеть ```student-vpc-k11```
        - Subnet name: ```public-subnet-k11```
        - Availability Zone: ```eu-central-1a```
        - IPv4 CIDR block: ```10.11.1.0/24```
        - Нажимаем ```Create subnet```

        ![Img-8](https://imgur.com/1HJADwm.jpg)

        ![Img-9](https://imgur.com/fvbVOsc.jpg)
    4.2. Создание приватной подсети
    - В левой панели выбераем ```Subnets → Create subnet``` ещё раз
    - Указываем:
        - VPC ID: выбераем созданную сеть ```student-vpc-k11```
        - Subnet name: ```private-subnet-k11```
        - Availability Zone: ```eu-central-1a```
        - IPv4 CIDR block: ```10.11.2.0/24```
        - Нажимаем ```Create subnet```

        ![Img-10](https://imgur.com/1HJADwm.jpg)

        ![Img-11](https://imgur.com/ujuD4Ql.jpg)

        ![Img-12](https://imgur.com/0RgRHxm.jpg)

5) Создание таблиц маршрутов (Route Tables)
   5.1. Создание публичной таблицы маршрутов
   - В левой панели выбераем ```Route Tables → Create route table```
   - Указываем:
        - Name tag: ```public-rt-k11```
        - VPC: ```student-vpc-k11```
        - Нажимаем ```Create route table```
        - Перейдите на вкладку ```Routes``` и нажимаем ```Edit routes → Add route```
        - Заполняем:
            - Destination: ```0.0.0.0/0```
            - Target: выберите ```Internet Gateway (student-igw-k11)```
        - Нажимаем ```Save changes```
        - Переходим на вкладку ```Subnet associations → Edit subnet associations```
        - Отмечаем public-subnet-k11 и нажимаем ```Save associations```

        ![Img-13](https://imgur.com/CP8WxUn.jpg)

        ![Img-14](https://imgur.com/h1d6Fwc.jpg)

        ![Img-15](https://imgur.com/VvHAcjt.jpg)

        ![Img-16](https://imgur.com/6F4IvVg.jpg)
  
    5.2. Создание приватной таблицы маршрутов
    - В левой панели выбераем ```Route Tables → Create route table``` ещё раз
   - Указываем:
        - Name tag: ```private-rt-k11```
        - VPC: ```student-vpc-k11```
        - Нажимаем ```Create route table```
    - Переходим на вкладку ```Subnet associations → Edit subnet associations```
    - Отмечаем ```private-subnet-k11``` и нажимаем ```Save associations```

    ![Img-17](https://imgur.com/RhNA1nK.jpg)

    ![Img-18](https://imgur.com/w1YRGY3.jpg)
6) Создание NAT Gateway
   6.1. Создание Elastic IP
   - В левой панели выбераем ```Elastic IPs → Allocate Elastic IP address```
   - Нажимаем ```Allocate```

   ![Img-19](https://imgur.com/xKnMz1e.jpg)

   ![Img-20](https://imgur.com/BIIVAwH.jpg)
    6.2. Создание NAT Gateway
     - В левой панели выбераем ```NAT Gateways → Create NAT gateway```
     - Указываем:
        - Name tag: ```nat-gateway-k11```
        - Subnet: выбераем публичную подсеть ```(public-subnet-k11)```
        - Connectivity type: ```Public```
        - Elastic IP allocation ID: выбераем ```EIP```, созданный на предыдущем шаге
        - Нажимаем ```Create NAT gateway```

        ![Img-21](https://imgur.com/YRruTz9.jpg)

        ![Img-22](https://imgur.com/7V64R3Q.jpg)
  
    6.3. Изменение приватной таблицы маршрутов
    - Возвращаемся в ```Route Tables``` и выбераем```private-rt-k11```
    - Переходим на вкладку ```Routes``` и нажимаем ```Edit routes → Add route```
    - Заполняем:
        - Destination: ```0.0.0.0/0```
        - Target: выбераем ```NAT Gateway (nat-gateway-k11)```
    - Нажимаем ```Save changes```

    ![Img-23](https://imgur.com/DsMtMWl.jpg)

    ![Img-24](https://imgur.com/4m82alR.jpg)
7) Создание Security Groups
   - В левой панели выбераем ```Security Groups → Create security group```
   - Указываем:
       - Security group name: ```web-sg-k11```
       - Description: ```Security group for web server```
       - VPC: выбераем созданную VPC ```(student-vpc-k11)```
   - В разделе ```Inbound rules``` добавляем правила разрешающие следующие типы трафика:
       - Тип: ```HTTP, Протокол: TCP, Порт: 80, Источник: 0.0.0.0/0```
       - Тип: ```HTTPS, Протокол: TCP, Порт: 443, Источник: 0.0.0.0/0```
       ![Img-25](https://imgur.com/h0MpYkt.jpg)
   - Создаем еще две Security Groups:
        - ```bastion-sg-k11``` для bastion host с разрешением входящего трафика на порт 22 (SSH) только из вашего IP-адреса
        ![Img-26](https://imgur.com/chwHZmw.jpg)
        - ```db-sg-k11``` для базы данных с разрешением входящего трафика:
            - Тип: ```MySQL/Aurora, Протокол: TCP, Порт: 3306, Источник: web-sg-k11``` (разрешаем доступ только с веб-сервера)
            - Тип: ```SSH, Протокол: TCP, Порт: 22, Источник: bastion-sg-k11``` (разрешаем доступ только с bastion host)
            ![Img-27](https://imgur.com/6VEi3hw.jpg)
8) Создание EC2-инстансов
    - Создаем три EC2-инстанса, которые будут выполнять следующие роли:
       - Веб-сервер ```(web-server)``` - в публичной подсети, доступен из Интернета по HTTP
       - Сервер базы данных ```(db-server)``` - в приватной подсети, недоступен напрямую извне
       - Bastion Host ```(bastion-host)``` - в публичной подсети, для безопасного доступа к приватным ресурсам
    - Для всех инстансов используем:
        - AMI: ```Amazon Linux 2 AMI (HVM), SSD Volume Type```
        - Тип инстанса: ```t3.micro```
        - Ключ доступа (Key Pair): создаем новый ключ ```student-key-k11``` и скачиваем его
        ![Img-28](https://imgur.com/R7ruZw8.jpg)
        - Хранилище: оставляем по умолчанию (8 ГБ)
        - Теги: добавляем тег ```Name``` с соответствующим именем инстанса
    - Для web-server:
        - Выбераем сеть VPC: student-vpc-k11
        - Подсеть Subnet: public-subnet-k11
        - Auto-assign Public IP: Enable
        - Security Group: выберите web-sg-k11
        - В разделе Advanced Details в поле User data вставляем следующий скрипт для автоматической установки веб-сервера:

            ``` bash
            #!/bin/bash
            dnf install -y httpd php
            echo "<?php phpinfo(); ?>" > /var/www/html/index.php
            systemctl enable httpd
            systemctl start httpd
            ```

    - Для db-server:
        - Выбераем сеть VPC: student-vpc-k11
        - Подсеть Subnet: private-subnet-k11
        - Auto-assign Public IP: Disable
        - Security Group: выберите db-sg-k11
        - В разделе Advanced Details в поле User data вставляем следующий скрипт для автоматической установки веб-сервера:

            ``` bash
            #!/bin/bash
            dnf install -y mariadb105-server
            systemctl enable mariadb
            systemctl start mariadb
            mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'StrongPassword123!'; FLUSH PRIVILEGES;"
            ```

    - Для bastion-host:
        - Выбераем сеть VPC: student-vpc-k11
        - Подсеть Subnet: public-subnet-k11
        - Auto-assign Public IP: Enable
        - Security Group: выберите bastion-sg-k11
        - В разделе Advanced Details в поле User data вставляем следующий скрипт для автоматической установки веб-сервера:

            ``` bash
           #!/bin/bash
            dnf install -y mariadb105
            ```

        ![Img-29](https://imgur.com/DdHzkiS.jpg)

9) Проверка работы
    - Находим публичный IP-адрес web-server и открываем его в браузере. Мы  должны увидеть страницу с информацией о PHP
    ![Img-30](https://imgur.com/hWdd5We.jpg)
    - Подключаемся к ```bastion-host``` по SSH: ```ssh -i student-key-k11.pem ec2-user@18.197.188.143```
    ![Img-31](https://imgur.com/LMwVwQP.jpg)
    ![Img-32](https://imgur.com/0wtm3z9.jpg)
    - Проверяем подключение к интернету с bastion-host выполнив ping: ```ping -c 4 google.com```
    ![Img-33](https://imgur.com/gMOn12J.jpg)
    - С bastion-host попробуйте подключиться к db-server: ```mysql -h 10.11.2.179 -u root -p```
    ![Img-34](https://imgur.com/sS3u2xR.jpg)
    - Выходим из db-server и bastion-host
10) Дополнительные задания. Подключение в приватную подсеть через Bastion Host
    - Меняем тип запуска службы ssh-agent на автоматический:```sc config ssh-agent start= auto```
    - Запускаем службу ssh-agent: ```sc start ssh-agent```
    - Проверяем статус службы ssh-agent: ```sc query ssh-agent```
    - Добавляем закрытый ключ SSH (```student-key-k11.pem```) в запущенный ssh-agent: ```ssh-add C:\Users\user\.ssh\student-key-k11.pem```
    ![Img-35](https://imgur.com/CdyA9DQ.jpg)
    - Обновляем систему на db-server: ```sudo dnf update -y```
    - Устанавливам htop: ```sudo dnf install -y htop```
    - Подключаемся к к MySQL серверу: ```mysql -u root -p```
    ![Img-36](https://imgur.com/GZDXsvN.jpg)
11) Завершение работы
    - Удаляем:
      - EC2-инстансы
      - NAT Gateway
      - Elastic IP
      - Security Groups
      - Internet Gateway
      - созданную VPC

#### Контрольные вопросы

1) Что обозначает маска /16? И почему нельзя использовать, например, /8?
   - Маска /16 означает, что первые 16 бит адреса сети фиксированы, а оставшиеся 16 бит используются для адресации хостов внутри сети. Например, сеть 10.12.0.0/16 позволяет иметь адреса от 10.12.0.0 до 10.12.255.255, всего 65 536 адресов.

   - Использовать /8 (10.0.0.0/8) не рекомендуется, потому что это очень большая сеть (около 16 млн адресов) и может вызвать конфликты с другими подсетями, плюс AWS ограничивает размер VPC. /16 — безопасный и управляемый размер для учебной или рабочей VPC.
  
2) Является ли подсеть "публичной" на данный момент? Почему?
   На момент создания публичной подсети (public-subnet-k11) она ещё не является публичной, потому что сама по себе подсеть — это просто диапазон IP. Чтобы быть публичной, ей нужен маршрут к Internet Gateway через таблицу маршрутов. После привязки маршрута 0.0.0.0/0 → IGW она становится публичной.

3) Является ли подсеть "приватной" на данный момент? Почему?
   Приватная подсеть (private-subnet-k11) является приватной, потому что из неё нет прямого маршрута в Интернет. Все ресурсы внутри подсети могут общаться только внутри VPC, пока не настроен NAT Gateway и соответствующий маршрут.
4) Зачем необходимо привязать таблицу маршрутов к подсети?
   Привязка таблицы маршрутов сообщает AWS, какой маршрут использовать для трафика из конкретной подсети. Без привязки подсеть будет использовать таблицу по умолчанию, и ваш трафик может не пойти через IGW или NAT Gateway. Это ключевой шаг для разграничения публичных и приватных подсетей.
5) Как работает NAT Gateway?
   - NAT Gateway позволяет приватным инстансам выходить в Интернет исходящим трафиком, при этом оставаясь недоступными извне.

   - Принцип работы: приватный инстанс отправляет пакет → NAT Gateway в публичной подсети получает пакет и подменяет исходный IP на свой Elastic IP → пакет идёт в Интернет → ответ приходит на NAT Gateway → NAT Gateway перенаправляет пакет обратно приватному инстансу.
6) Что делает опция -A и -J?
   - -A — разрешает Agent Forwarding, т.е. позволяет использовать ваш приватный ключ на промежуточном хосте (bastion-host), чтобы подключаться дальше к приватным инстансам без копирования ключа на промежуточный сервер.

   - -J — JumpHost / ProxyJump, указывает SSH сначала подключиться к промежуточному хосту, а затем к целевому серверу.
  
#### Вывод

В ходе работы мы научились создавать и настраивать виртуальные сети в AWS, включая VPC и подсети с различной изоляцией — публичную для ресурсов с доступом в Интернет и приватную для внутренних ресурсов. Были настроены Internet Gateway для публичной подсети и NAT Gateway для приватной, что показало разницу между прямым и косвенным доступом к внешним ресурсам. Освоили создание и привязку таблиц маршрутов к подсетям, что позволило контролировать направление сетевого трафика и обеспечивать правильное взаимодействие ресурсов. Также были изучены и применены Security Groups и Bastion Host для безопасного доступа к приватным инстансам. В результате веб-сервер в публичной подсети смог взаимодействовать с сервером базы данных в приватной подсети, оставаясь при этом недоступным извне, что наглядно продемонстрировало принципы сетевой изоляции и маршрутизации.

#### Используемые источники

1) [Link-1](https://elearning.usm.md/mod/assign/view.php?id=316713)

2) [Link-2](https://chatgpt.com/)

3) [Link-3](https://eu-north-1.signin.aws.amazon.com/oauth?response_type=code&client_id=arn%3Aaws%3Asignin%3A%3A%3Aconsole%2Fcanvas&redirect_uri=https%3A%2F%2Fconsole.aws.amazon.com%2Fconsole%2Fhome%3FhashArgs%3D%2523%26isauthcode%3Dtrue%26state%3DhashArgsFromTB_eu-north-1_d358d9b76aae69ff&forceMobileLayout=0&forceMobileApp=0&code_challenge=QNPqzCbZA50S9D-SelPL1-61GK5Lf3-Mlx1hrXq43jQ&code_challenge_method=SHA-256)
