# Тема: Облачные базы данных. Amazon RDS, DynamoDB

> Подготовила: Доцен Анна

---

## Цель работы: Изучить сервисы Amazon RDS и Amazon DynamoDB, освоить создание и настройку облачных реляционных баз данных, а также работу с репликами чтения (Read Replicas) для повышения производительности и отказоустойчивости. Кроме того, необходимо научиться подключаться к базе данных из виртуальной машины EC2 и выполнять основные операции CRUD

---

### Этапы выполнения

1) Создаем VPC с двумя публичными и двумя приватными подсетями в разных зонах доступности (AZ). В данной подсети будут развернуты базы данных и приложение
   - Для создания подсетей используем мастера создания VPC ```(Create VPC -> VPC and more)``` в консоли AWS
2) Создаем группу безопасности для приложения, которая разрешает следующий трафик
   - В левой панели выбираем ```Your VPCs → Create VPC```
   - Указываем:
        - Входящий: HTTP (порт 80) от любого источника
        - Входящий: SSH (порт 22) от моего IP-адреса

        ![Img-1](https://imgur.com/gW1Irtf.jpg)  

        ![Img-2](https://imgur.com/QexFfMl.jpg)

        ![Img-3](https://imgur.com/sfzudr3.jpg)

        ![Img-4](https://imgur.com/0dJdikO.jpg)

        ![Img-5](https://imgur.com/F1gt41K.jpg)

        ![Img-6](https://imgur.com/BecftTQ.jpg)

        ![Img-7](https://imgur.com/GMq6iXe.jpg)

3) Создание групп безопасности
   - Создаем группу безопасности ```web-security-group_Anya``` для вашего приложения, разрешающий следующий трафик:
     - Входящий: ```HTTP (порт 80) от любого источника```
     - Входящий: ```SSH (порт 22) от нашего IP-адреса```

    ![Img-8](https://imgur.com/Mb2VgPU.jpg)

    ![Img-9](https://imgur.com/wnAqPO1.jpg)

   - Создаем группу безопасности для базы данных, которая разрешает следующий трафик
   - Входящий: ```MySQL/Aurora``` (порт 3306) от ```web-security-group_Anya```

    ![Img-10](https://imgur.com/ENssErM.jpg)  

    ![Img-11](https://imgur.com/wP1fOlj.jpg)

4) Меняем web-security-group, добавив правило для исходящего трафика
   - Исходящий: MySQL/Aurora (порт 3306) к db-mysql-security-group (т.е. приложение сможет инициализировать соединение с базой данных)

    ![Img-12](https://imgur.com/FwHdJUk.jpg)

    ![Img-13](https://imgur.com/ahEv0by.jpg)

5) Развертывание Amazon RDS
   - Переходим в консоль Amazon Aurora and RDS
   - Создаем ```Subnet Group``` для вашей базы данных:
        - Название: ```project-rds-subnet-group_Anya```
        - Выбераем созданный ранее VPC и добавляем 2 приватные подсети из 2 разных AZ.

        ![Img-14](https://imgur.com/tTlTXIm.jpg)

        ![Img-15](https://imgur.com/iO1LOZo.jpg)
  
6) Создаем экземпляр базы данных Amazon RDS (Databases -> Create database)
   - В разделе ```Choose a database creation method``` выбераем ```Standard Create```. Это позволит настроить все параметры базы данных вручную

   - Выбераем следующие параметры базы данных:
       - Engine type: ```MySQL```
       - Version: ```MySQL 8.0.42```
       - Templater: Free tier
       - Availability and durability: ```Single-AZ DB instance deployment```
       - DB instance identifier (название сервера базы данных): ```project-rds-mysql-prod-Anya```
       - Master username: admin
       - Master password: вводим и подтверждаем пароль для пользователя администратора
       - DB instance class: ```Burstable classes (includes t classes), db.t3.micro```
       - Storage:
          - Storage type: ```General Purpose SSD (gp3)```
          - Allocated storage: ```20 GB```
          - Enable storage autoscaling: ```Checked```
          - Maximum storage threshold: ```100 GB```

          ![Img-16](https://imgur.com/kOTXM73.jpg)

          ![Img-17](https://imgur.com/OSgpMgG.jpg)

          ![Img-18](https://imgur.com/Ar8tykz.jpg)

          ![Img-18](https://imgur.com/Xx0P3LG.jpg)

       - Connectivity (подключение):
          - Выбераем ```Don’t connect to an EC2 compute resource```
          - Virtual private cloud (VPC): ```выбираем созданный ранее VPC```
          - DB subnet group: ```выбираем созданную ранее Subnet Group```
          - Public access: ```No```
          - Existing VPC security groups: ```выбираем созданную ранее группу безопасности```
          - Availability zone: ```No preference```

          ![Img-18](https://imgur.com/7SHiiit.jpg)

          ![Img-19](https://imgur.com/AXV61Ey.jpg)

       - Additional configuration:
          - Initial database name: ```project_db_Anya```
          - Backup (Enable automated backup) ставим галочку (для создания read replica необходимы бэкапы)
          - Backup (Enable encryption) снимаем галочку
          - Maintanance (Enable auto minor version upgrade) снимаем галочку

          ![Img-20](https://imgur.com/0XIaeoT.jpg)

          ![Img-21](https://imgur.com/LssCubX.jpg)

       - Нажмаем ```Create database``` для создания базы данных

       - Дождаемся завершения создания базы данных (статус должен измениться на Available)

       ![Img-22](https://imgur.com/ShxPh1I.jpg)
  
       - Копируем ```Endpoint``` базы данных, он понадобится для подключения

       ![Img-23](https://imgur.com/JYEDoRk.jpg)

7) Создание виртуальной машины для подключения к базе данных
   - Подключаемся к виртуальной машине EC2 по SSH ```ssh -i C:\Users\user\.ssh\student-key-k11.pem ec2-user@3.122.230.139```
   - Подключаемся к базе данных RDS с помощью MySQL клиента: ```mysql -h project-rds-mysql-prod-anya.c9u4g0agi29g.eu-central-1.rds.amazonaws.com -u admin -p```

   ![Img-24](https://imgur.com/xhs0ZsD.jpg)

   ![Img-25](https://imgur.com/42VthiZ.jpg)

   - Вводим пароль администратора базы данных, который вы указали при создании базы данных
   - После успешного подключения выбераем базу данных: sql USE ```project_db_Anya```
   - Создаем две таблицы. Между таблицами обязательно должна быть связь 1 ко многим (one-to-many)
   - Вставляем несколько записей в каждую таблицу
   - Выполняем несколько запросов на выборку данных, включая JOIN между таблицами

   ![Img-26](https://imgur.com/BERQBGR.jpg)

   ![Img-27](https://imgur.com/4mQTu3U.jpg)

   ![Img-28](https://imgur.com/CP7R3Za.jpg)

8) Создание Read Replica
   - Выбераем базу данных RDS в консоли AWS

   ![Img-29](https://imgur.com/QT10Ctc.jpg)

   - Нажимаем на кнопку ```Actions``` и выбераем ```Create read replica```
   - Указываем следующие параметры для Read Replica:
       - DB instance identifier: ```project-rds-mysql-read-replica-Anya```
       - Instance class: db.t3.micro
       - Storage type: General Purpose SSD (gp3)
       - Monitoring
         - Enable Enhanced monitoring: снимаем галочку
       - Public access: No
       - VPC security groups: выбираем ту же группу безопасности ```db-mysql-security-group_Anya```

       ![Img-30](https://imgur.com/HORJ3Ct.jpg)

       ![Img-31](https://imgur.com/cwXta27.jpg)

       ![Img-32](https://imgur.com/IYBAdwg.jpg)

       ![Img-33](https://imgur.com/GZGySWw.jpg)

   - Дождитесь, пока реплика перейдёт в Available. У неё будет свой endpoint (только для чтения)

   ![Img-31](https://imgur.com/aGdlZwa.jpg)

   - Подключаемся к Read Replica с вашей виртуальной машины EC2 ```mysql -h project-rds-mysql-read-replica-anya.c9u4g0agi29g.eu-central-1.rds.amazonaws.com -u admin -p``` и выполняем запросы на чтение данных (SELECT) из таблиц, созданных на основном экземпляре базы данных
   - Пробуем выполнить запрос на запись (INSERT/UPDATE) на реплике
   - Переходим на основной экземпляр базы данных и добавьте новую запись в одну из таблиц
   - Возвращаемся к подключению к Read Replica и выполните запрос на чтение

   ![Img-32](https://imgur.com/c0zCQHy.jpg)

   ![Img-33](https://imgur.com/5UZlIlE.jpg)

   ![Img-34](https://imgur.com/nzDMYOG.jpg)

   ![Img-35](https://imgur.com/pJx84gm.jpg)

   ![Img-36](https://imgur.com/YkDVZNn.jpg)

   ![Img-37](https://imgur.com/mxwZhqL.jpg)

   ![Img-38](https://imgur.com/SGmIoCd.jpg)

   ![Img-39](https://imgur.com/zCSoB0N.jpg)

9) Развертывание CRUD приложения
    - Разрабатываем и развертываем простое веб-приложение на вашей виртуальной машине Amazon EC2
    - Настраиваем приложение таким образом, чтобы для операций записи и изменения данных использовался основной экземпляр (master instance), а для операций чтения - реплика для чтения (read replica)

    ![Img-40](https://imgur.com/JHL9CMI.jpg)

    ```python
    from flask import Flask, request, jsonify
    import pymysql
    app = Flask(__name__)
    # Настройки подключения
    MASTER_DB = {
        'host': 'project-rds-mysql-prod-anya.c9u4g0agi29g.eu-central-1.rds.amazonaws.com',
        'user': 'admin',
        'password': 'Anya916004',
        'database': 'project_db_Anya'
    }
    REPLICA_DB = {
        'host': 'project-rds-mysql-read-replica-anya.c9u4g0agi29g.eu-central-1.rds.amazonaws.com',
        'user': 'admin',
        'password': 'Anya916004',
        'database': 'project_db_Anya'
    }
    def get_connection(master=True):
        db_config = MASTER_DB if master else REPLICA_DB
        return pymysql.connect(
            host=db_config['host'],
            user=db_config['user'],
            password=db_config['password'],
            database=db_config['database']
        )
    # --- CRUD операции ---
    # READ: получить все категории (используем реплику)
    @app.route('/categories', methods=['GET'])
    def get_categories():
        conn = get_connection(master=False)
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        cursor.execute("SELECT * FROM categories")
        result = cursor.fetchall()
        conn.close()
        return jsonify(result)
    # CREATE: добавить новую категорию (используем мастер)
    @app.route('/categories', methods=['POST'])
    def add_category():
        data = request.get_json()
        conn = get_connection(master=True)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO categories (name) VALUES (%s)", (data['name'],))
        conn.commit()
        conn.close()
        return jsonify({'status': 'Category added'}), 201
    # UPDATE: изменить категорию по id (мастер)
    @app.route('/categories/<int:id>', methods=['PUT'])
    def update_category(id):
        data = request.get_json()
        conn = get_connection(master=True)
        cursor = conn.cursor()
        cursor.execute("UPDATE categories SET name=%s WHERE id=%s", (data['name'], id))
        conn.commit()
        conn.close()
        return jsonify({'status': 'Category updated'})
    # DELETE: удалить категорию по id (мастер)
    @app.route('/categories/<int:id>', methods=['DELETE'])
    def delete_category(id):
        conn = get_connection(master=True)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM categories WHERE id=%s", (id,))
        conn.commit()
        conn.close()
        return jsonify({'status': 'Category deleted'})

    if __name__ == '__main__':
        app.run(host='0.0.0.0', port=5000)
   ```

    ![Img-41](https://imgur.com/cNvPKQy.jpg)

    ![Img-42](https://imgur.com/O2XAGJy.jpg)

---

#### Контрольные вопросы

1) **Что такое Subnet Group и зачем она нужна для базы данных RDS?**
   ```Subnet Group``` — это набор приватных подсетей в пределах одной VPC, обычно расположенных в разных зонах доступности (AZ). Она указывает Amazon RDS, где именно внутри VPC можно разместить экземпляр базы данных. Без Subnet Group RDS не знает, какие подсети использовать. Также Subnet Group повышает отказоустойчивость — база данных сможет работать даже при сбое одной зоны, если используется Multi-AZ.
  
2) **Какие данные вы видите при подключении к Read Replica и выполнении SELECT-запросов? Почему?**
   На Read Replica видны те же данные, что и на основном экземпляре базы данных. Это происходит потому, что реплика создаётся как копия основного экземпляра и синхронизируется с ним через механизм асинхронной репликации. Все изменения, внесённые в основную базу, автоматически передаются на реплику.

3) **Получилось ли выполнить запись (INSERT/UPDATE) на реплике? Почему?**
   Нет, выполнить запись не удалось. Реплика работает в режиме “read-only” (только для чтения), что предотвращает внесение изменений. Это сделано специально, чтобы избежать конфликтов данных между основной базой и её копиями, ведь реплика предназначена только для чтения.
4) **Что произошло, когда вы добавили новую запись в основную базу и потом сделали SELECT на реплике? Почему так?**
   После добавления новой записи в основную базу данных эта запись появилась и на реплике через короткое время. Это объясняется тем, что реплика получает обновления от основной базы с помощью асинхронной репликации — данные передаются автоматически с небольшой задержкой.
5) **Зачем нужны Read Replicas и когда их используют?**
   Read Replicas нужны для распределения нагрузки и повышения производительности базы данных. Они позволяют выполнять операции чтения (например, SELECT-запросы) на копиях базы, разгружая основной экземпляр, который занимается записями и изменениями данных. Это полезно при высоких нагрузках, аналитике, отчётности и при необходимости масштабировать систему. Кроме того, реплику можно быстро повысить до основного экземпляра в случае сбоя, что улучшает отказоустойчивость.

---

#### Вывод

В ходе работы была создана и настроена облачная база данных Amazon RDS с репликой чтения (Read Replica), обеспечивающей масштабируемость и отказоустойчивость. Настроено подключение к базе данных с виртуальной машины EC2 и выполнены операции CRUD. Также разработано простое веб-приложение на Flask, взаимодействующее с основной и реплицированной базами.

---

#### Используемые источники

1) [Elearning](https://elearning.usm.md/mod/assign/view.php?id=320200)

2) [Chat GPT](https://chatgpt.com/)

3) [Amazon](https://eu-north-1.signin.aws.amazon.com/oauth?response_type=code&client_id=arn%3Aaws%3Asignin%3A%3A%3Aconsole%2Fcanvas&redirect_uri=https%3A%2F%2Fconsole.aws.amazon.com%2Fconsole%2Fhome%3FhashArgs%3D%2523%26isauthcode%3Dtrue%26state%3DhashArgsFromTB_eu-north-1_d358d9b76aae69ff&forceMobileLayout=0&forceMobileApp=0&code_challenge=QNPqzCbZA50S9D-SelPL1-61GK5Lf3-Mlx1hrXq43jQ&code_challenge_method=SHA-256)
