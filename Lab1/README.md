# Введение в AWS. Вычислительные сервисы

> Лабораторная работа №2
>> Доцен Анна

## Цель работы

Познакомиться с основными вычислительными сервисами AWS, научиться создавать и настраивать виртуальные машины (EC2), а также развёртывать простые веб-приложения.

### Постановка задачи и этапы выполнения

1) Подготовка среды
   - В ходе выполнения данного этапа, я зарегистировалась в AWS
   - Вошла в консоль управления под root-пользователем
   - В правом верхнем углу выберала регион ```EU (Frankfurt) eu-central-1```
2) Создание IAM группы и пользователя
   - Создала IAM группу ```Admins```
   - Создала IAM пользователя
   - Убедилась, что пользователь создан и имеет доступ к консоли
   - Вышла из консоли под root-пользователем и вошла под новым IAM пользователем
3) Настройка Zero-Spend Budget
    - Открыла сервис ```Billing and Cost Management```
    - В меню слева выбрала ```Budgets → Create budget```
    - Выбрала ```Zero spend budget``` шаблон и указала следующие параметры:
      - Budget name: ZeroSpend
      - Email recipients: my email
   - Нажала ```Create budget``` внизу страницы
4) Создание и запуск EC2 экземпляра (виртуальной машины)
   - Открываем сервис EC2
   - В меню слева выбираем ```Instances → Launch instances```
   
    ![Img-1](https://imgur.com/iB3DZ1o.jpg)
   
    ![Img-2](https://imgur.com/ejPNCDg.jpg)
   - Заполняем соответствующие параметры для запуска виртуальной машины:
        - ```Name and tags:``` webserver
        ![Img-3](https://imgur.com/SO5QeY2.jpg)
        - ```AMI:``` Выбераем ```Amazon Linux 2023 AMI``` - это образ, который будет использоваться для создания виртуальной машины
        ![Img-4](https://imgur.com/mquyNaH.jpg)
        - ```Instance type:``` t3.micro
        ![Img-5](https://imgur.com/qxHIylX.jpg)
        - ```Key pair``` - это криптографическая пара ключей (приватный и публичный). Она нужна для безопасного входа на сервер по SSH
     
        ![Img-6](https://imgur.com/LYTQoNY.jpg)
        - ```Security group``` - это набор правил, которые определяют, какой трафик разрешен к вашему экземпляру
        ![Img-7](https://imgur.com/hWMC5a5.jpg)
        - ```Network settings``` оставляем настройки по умолчанию. AWS автоматически создаст виртуальную сеть (VPC) и подсеть (subnet)
        - ```Configure Storage``` оставляем настройки по умолчанию
        - ```Advanced details → User Data``` и вставляем следующий скрипт:

            ```bash
            #!/bin/bash
            dnf -y update
            dnf -y install htop
            dnf -y install nginx
            systemctl enable nginx
            systemctl start nginx
            ```

            ![Img-8](https://imgur.com/p8H5zCV.jpg)
    - Нажмаем ```Launch instance``` и дождаемся статуса Running и Status checks: 3/3
    ![Img-9](https://imgur.com/QAIKRrZ.jpg)
    - Проверяем, что веб-сервер работает, открыв в браузере URL: ```http://3.121.237.214```
    ![Img-10](https://imgur.com/ZTH76wh.jpg)
6) Логирование и мониторинг
   - Открываю вкладку ```Status checks```, убедимся, что все проверки прошли успешно
   ![Img-11](https://imgur.com/7bSPSAI.jpg)
   - Открываем вкладку ```Monitoring```
   ![Img-12](https://imgur.com/yAY8YE2.jpg)
   

    - Просматриваю системный лог
   ![Img-13](https://imgur.com/02iwen2.jpg)
   ![Img-14](https://imgur.com/MRuU957.jpg)
   - Просматриваю снимок экрана инстанса
   ![Img-15](https://imgur.com/9gaUpx5.jpg)
8) Подключение к EC2 инстансу по SSH
   - Открываю терминал
   - Перехожу в директорию где находится мой приватный ключ
   - Подключаюсь к инстансу по SSH, используя команду ```ssh -i KeyPairForLabs.pem ec2-user@3.75.221.155```
   ![Img-16](https://imgur.com/iInvASz.jpg)
   - Проверяю статус веб-сервера Nginx при помощи команды ```systemctl status nginx```
   ![Img-17](https://imgur.com/Z9mJVX8.jpg)
9) Развёртывание веб-сайта на PHP
   - Использование команды для просмотра прав доступа пользователя

   ```
   ls -l /usr/share/nginx/html
   ```

   - Делаю смену прав пользователя

   ```
   sudo chown -R ec2-user:ec2-user /usr/share/nginx/html
   sudo chmod -R 755 /usr/share/nginx/html
   ```

   ![Img-18](https://imgur.com/PFk58K8.jpg)
   - Копирую файлы веб-приложения на сервер

   ```
      scp -i C:\Users\user\.ssh\KeyPairForLabs.pem -r D:\Cloud\* ec2-user@3.75.221.155:/usr/share/nginx/html
   ```

   - Подключаюсь к инстансу по SSH
   - Установливаю Nginx и PHP-FPM

   ```
   sudo dnf -y install nginx php php-fpm
   ```

   ![Img-19](https://imgur.com/CYppdow.jpg)
   ![Img-20](https://imgur.com/pVXhEmY.jpg)
   - Запускаю сервисы

   ```
   sudo systemctl enable nginx
   sudo systemctl start nginx
   sudo systemctl enable php-fpm
   sudo systemctl start php-fpm
   ```

   ![Img-21](https://imgur.com/wdppq6s.jpg)
   - Проверяю статус

   ```
   sudo systemctl status nginx
   sudo systemctl status php-fpm
   ```

   ![Img-22](https://imgur.com/HJYCnCZ.jpg)
   - Настраиваю Nginx для работы с PHP
     - Создаю резервную копию основного конфигурационного файла Nginx
     ![Img-23](https://imgur.com/156BIn5.jpg)
     - Создаю новый конфигурационный файл для вашего сайта на локальном компьютере, например ```mywebsite.conf```

         ```nginx
         server {
            listen 80;
            server_name _;

            root /usr/share/nginx/html;
            index index.php index.html index.htm;

            location / {
                  try_files $uri $uri/ =404;
            }

            location ~ \.php$ {
                  include snippets/fastcgi-php.conf;
                  fastcgi_pass unix:/run/php-fpm/www.sock;
            }

            location ~ /\.ht {
                  deny all;
            }
            }

         ```

         ![Img-24](https://imgur.com/clTq3WI.jpg)
      - Копирую этот файл на сервер в директорию ```/etc/nginx/conf.d/```
  
      ```nginx
      scp -i KeyPairForLabs.pem mywebsite.conf ec2-user@3.75.221.155:/tmp
      ssh -i KeyPairForLabs.pem ec2-user@3.75.221.155 "sudo mv /tmp/mywebsite.conf /etc/nginx/conf.d/"
      ```

      - Проверяю конфигурацию Nginx на наличие ошибок
      ![Img-25](https://imgur.com/9Pva4Rz.jpg)
      - Перезапускаю Nginx
      ```sudo systemctl restart nginx```

#### Ответы на контрольные вопросы

1) Что делает данная политика?
   ```AdministratorAccess``` — это предопределённая политика AWS IAM, которая предоставляет полный административный доступ ко всем сервисам и ресурсам AWS. То есть любой пользователь, добавленный в группу Admins, сможет:
   - запускать/удалять инстансы EC2
   - работать с S3, RDS, VPC, IAM и любыми другими сервисами
   - создавать и удалять ресурсы, изменять настройки безопасности
2) Что такое User Data и какую роль выполняет данный скрипт? Для чего используется nginx?
   
   ```User Data``` — это скрипт, который можно задать при запуске EC2-инстанса. Он выполняется автоматически при первом запуске сервера. Обычно используется для:
   - установки пакетов (например, nginx, php-fpm)
   - настройки окружения
   - развертывания приложения
     
   ```Nginx``` - это веб-сервер для обработки HTTP/HTTPS-запросов

   В контексте PHP-сайта он:
   - принимает запрос от клиента
   - отдаёт статические файлы (HTML, CSS, JS, картинки)
   - передаёт динамические запросы (.php) в PHP-FPM для выполнения
   - возвращает клиенту результат
3) В каких случаях важно включать детализированный мониторинг?
   - По умолчанию CloudWatch даёт метрики EC2 раз в 5 минут.
   - Детализированный мониторинг включает метрики каждую минуту.
   Это важно:
   - при высокой нагрузке, когда нужно быстро реагировать
   - для авто-масштабирования (Auto Scaling Group), чтобы быстрее запускались/останавливались инстансы
   - при отладке производительности или проблем с сервером
4) Почему в AWS нельзя использовать пароль для входа по SSH?
   - По умолчанию AWS отключает вход по паролю из соображений безопасности
   - Доступ осуществляется только через SSH-ключи (.pem).
   Причины:
   - пароль легко подобрать брутфорсом
   - ключи SSH гораздо надёжнее (случайная криптография, не угадаешь)
   - удобнее управлять доступом (можно просто выдать/отозвать ключ)
5) Что делает данный конфигурационный файл Nginx?

   ```nginx
         server {
            listen 80;
            server_name _;

            root /usr/share/nginx/html;
            index index.php index.html index.htm;

            location / {
                  try_files $uri $uri/ =404;
            }

            location ~ \.php$ {
                  include snippets/fastcgi-php.conf;
                  fastcgi_pass unix:/run/php-fpm/www.sock;
            }

            location ~ /\.ht {
                  deny all;
            }
            }

      ```

   - ```listen 80;``` — сервер слушает HTTP-запросы на 80-м порту
   - ```server_name _;``` — принимает запросы для любого домена (wildcard)
   - ```root /usr/share/nginx/html;``` — корневая папка сайта
   - ```index index.php index.html index.htm;``` — порядок файлов по умолчанию
   - ```location / { try_files $uri $uri/ =404; }``` — проверяет, существует ли файл/папка, иначе отдаёт 404
   - ```location ~ \.php$ { ... }``` — все .php файлы отправляются на обработку в PHP-FPM
   - ```location ~ /\.ht { deny all; }``` — запрещает доступ к .ht* файлам (например, .htaccess)

##### Вывод

В ходе работы был создан и настроен сервер EC2 в AWS, развернуто простое PHP-веб-приложение с использованием Nginx и PHP-FPM, а также изучены основы управления доступом через IAM. Цель работы достигнута — получены практические навыки работы с облачной инфраструктурой и развёртывания веб-приложений.

##### Используемые источники

1) [Link-1](https://elearning.usm.md/mod/assign/view.php?id=315493)
2) [Link-2](https://chatgpt.com/)

3) [Link-3](https://eu-north-1.signin.aws.amazon.com/oauth?response_type=code&client_id=arn%3Aaws%3Asignin%3A%3A%3Aconsole%2Fcanvas&redirect_uri=https%3A%2F%2Fconsole.aws.amazon.com%2Fconsole%2Fhome%3FhashArgs%3D%2523%26isauthcode%3Dtrue%26state%3DhashArgsFromTB_eu-north-1_d358d9b76aae69ff&forceMobileLayout=0&forceMobileApp=0&code_challenge=QNPqzCbZA50S9D-SelPL1-61GK5Lf3-Mlx1hrXq43jQ&code_challenge_method=SHA-256)



