# Тема: Облачное хранилище данных Amazon S3

> Подготовила: Доцен Анна

---

## Цель работы

Цель данной лабораторной работы заключается в ознакомлении с сервисом `Amazon S3 (Simple Storage Service)` и освоении основных принципов его использования. В ходе работы мы учимся создавать публичные и приватные бакеты, загружать и организовывать объекты, работать с сервисом через `AWS CLI` (выполняя копирование, перемещение и синхронизацию данных), настраивать версионирование и шифрование, использовать `S3 Static Website Hosting` для размещения статических сайтов, а также применять `Lifecycle-политики` для автоматического архивирования и оптимизации хранения старых данных.

---

### Этапы выполнения

1) Подготовка среды
   - Входим в AWS Management Console
   - Проверяем регион `(Frankfurt (eu-central-1))`
   - Создаем локальную структуру файлов:

        ```plaintext
            s3-lab/
        ├── public/
        │   ├── avatars/
        │   │   ├── user1.jpg
        │   │   └── user2.jpg
        │   └── content/logo.png
        ├── private/
        │   └── logs/
        │       └── activity.csv
        └── README.md
        ```

2) Создание бакетов без ACL
   **Создание публичного бакета**
    - Переходим в *AWS Console → S3 → Create bucket*.  
    - Задаём параметры:
      - *Имя:* `cc-lab4-pub-k11`  
      - *Регион:* `eu-central-1`  
      - *Object Ownership:* выбираем `Bucket owner enforced (ACLs disabled)`
      - *Block all public access:* оставляем *включённым* (позже изменим)  
    - Нажимаем `Create bucket`.
    ![Img-1](https://imgur.com/eqAJNA1.jpg)
    ![Img-2](https://imgur.com/bg10OtU.jpg)
    ![Img-3](https://imgur.com/UAMpXPU.jpg)
    ![Img-4](https://imgur.com/LNnKLnJ.jpg)
    **Создание приватного бакета**
    Повторяем шаги выше, но указываем:
    - *Имя:* `cc-lab4-priv-k11`  
    - Остальные параметры — те же.
    ![Img-5](https://imgur.com/oOA6BZH.jpg)
    ![Img-6](https://imgur.com/N8gLUi5.jpg)
3) Создание IAM-пользователя и выдача прав
    - Используем *Object Ownership Enforced* - современный, безопасный способ
  
    3.1 Создание пользователя
      - Переходим в **IAM → Users → Create user**.  
      - В поле имени вводим **s3-uploader_Anya**.  
      - Не включаем **Console access**, так как пользователь будет работать только через CLI.  
      - После создания пользователя переходим на вкладку **Security credentials** и нажимаем **Create access key**.  
      - В типе доступа выбираем **Command Line Interface (CLI)**.  
      - Копируем **Access key ID** и **Secret access key** — они понадобятся при настройке AWS CLI.
      ![Img-7](https://imgur.com/oZBIK8a.jpg)
      ![Img-8](https://imgur.com/O7oHQP9.jpg)
      ![Img-9](https://imgur.com/sDyJ6fr.jpg)
      ![Img-10](https://imgur.com/hXU6p24.jpg)
      ![Img-11](https://imgur.com/a47Wkuo.jpg)
  
    3.2. Создание IAM-политики (минимальные права)
    Теперь необходимо создать политику, которая позволит пользователю:
   - загружать, просматривать и удалять файлы в **публичном бакете**;
   - работать только с префиксом `logs/` в **приватном бакете**.

    Для этого переходим в **IAM → Policies → Create policy → JSON**.  
    ![Img-12](https://imgur.com/dLhXint.jpg)
    Вставляем следующий JSON-код, заменив `kXX` на `k11`:

    ```json
    {
    "Version": "2012-10-17",
    "Statement": [
        {
        "Sid": "ListOnlyTheseBuckets",
        "Effect": "Allow",
        "Action": ["s3:ListBucket"],
        "Resource": [
            "arn:aws:s3:::cc-lab4-pub-k11",
            "arn:aws:s3:::cc-lab4-priv-k11"
        ]
        },
        {
        "Sid": "ReadWritePublicBucketLimited",
        "Effect": "Allow",
        "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
        "Resource": "arn:aws:s3:::cc-lab4-pub-k11/*"
        },
        {
        "Sid": "LogsRWButOnlyUnderLogsPrefix",
        "Effect": "Allow",
        "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
        "Resource": "arn:aws:s3:::cc-lab4-priv-k11/logs/*"
        }
    ]
    }
    ```

    ![Img-13](https://imgur.com/I5rV4aa.jpg)

    После вставки нажимаем `Next: Tags → Next: Review`, вводим имя политики:`S3UploaderPolicy_Anya`, затем нажимаем `Create policy`.
  
    ![Img-14](https://imgur.com/dLhXint.jpg)

    3.3. Привязка политики к пользователю
    Переходим в `IAM → Users → s3-uploader → Permissions → Add permissions.`

    - Выбираем `Attach policies directly`.
    - Находим созданную ранее политику `S3UploaderPolicy_Any`a.
    - Нажимаем Next: Review → Add permissions.

    Теперь пользователь s3-uploader имеет права для загрузки, чтения и удаления файлов в бакетах cc-lab4-pub-k11 и cc-lab4-priv-k11
    ![Img-15](https://imgur.com/sXavUSA.jpg)

4) Разрешение чтения из публичного бакета
   Чтобы сделать файлы в публичном бакете доступными для всех пользователей (например, для отображения аватаров), нужно добавить Bucket Policy.

    - Переходим в `S3 → cc-lab4-pub-k11 → Permissions → Block public access (BPA)`.

    ![Img-16](https://imgur.com/y38falW.jpg)

    - Снимаем флажок `“Block all public access”` и нажимаем Save.

    ![Img-17](https://imgur.com/LzdAofD.jpg)

    ![Img-18](https://imgur.com/vgtTiXs.jpg)

    ![Img-19](https://imgur.com/IrIZRw3.jpg)

    - Ниже открываем `Bucket policy → Edit` и вставляем следующий JSON:

    ```json
        {
    "Version": "2012-10-17",
    "Statement": [
        {
        "Sid": "AllowPublicRead",
        "Effect": "Allow",
        "Principal": "*",
        "Action": "s3:GetObject",
        "Resource": [
            "arn:aws:s3:::cc-lab4-pub-k11/avatars/*",
            "arn:aws:s3:::cc-lab4-pub-k11/content/*"
        ]
        }
    ]
    }
    ```

    ![Img-20](https://imgur.com/jwnFMAy.jpg)

    ![Img-21](https://imgur.com/xBVCiLP.jpg)

    ![Img-22](https://imgur.com/xBVCiLP.jpg)

    - Нажимаем Save changes.

5) Проверка работы
    - Заливаем файлы в публичный бакет при помощи команд:

     ```cmd
     aws s3 cp s3-lab/public/avatars/user1.jpg s3://cc-lab4-pub-k11/avatars/user1.jpg
     aws s3 cp s3-lab/public/avatars/user2.jpg s3://cc-lab4-pub-k11/avatars/user2.jpg
     aws s3 cp s3-lab/public/content/logo.png s3://cc-lab4-pub-kXX/content/logo.png
     aws s3 cp s3-lab/private/logs/activity.csv s3://cc-lab4-priv-kXX/logs/activity.csv
     ```

    ![Img-23](https://imgur.com/k5zCaof.jpg)

    - Проверяем работоспособность

    ![Img-24](https://imgur.com/PKGl5KD.jpg)

    ![Img-25](https://imgur.com/mtmsaRM.jpg)

6) Версионирование объектов
    Включаем версионирование для публичного бакета

    - Переходим в `S3 → cc-lab4-pub-k11 → Properties.`  
    - Находим раздел `Bucket Versioning.`
    - Нажимаем `Edit → Enable → Save changes.`

    ![Img-26](https://imgur.com/jphAZfU.jpg)
    ![Img-27](https://imgur.com/kjZtYvw.jpg)
    ![Img-28](https://imgur.com/so3qe2b.jpg)

    Включаем версионирование для приватного бакета

    - Аналогично: `S3 → cc-lab4-priv-k11 → Properties.`
    - Включаем Bucket `Versioning → Enable → Save changes.`

    ![Img-29](https://imgur.com/DObQ8It.jpg)

    ```cmd
    aws s3 cp s3-lab/public/content/logo.png s3://cc-lab4-pub-kXX/content/logo.png
    ```

    ![Img-30](https://imgur.com/Y4ll20B.jpg)

    ![Img-31](https://imgur.com/PlZ3Zos.jpg)

    Теперь при каждом изменении файла (например, при повторной загрузке файла с тем же именем)
    S3 будет сохранять старую версию и присваивать ей `VersionId`.  
    Это особенно полезно в приватном бакете для логов и критичных данных.

7) Создание Lifecycle-правил для приватного бакета
    Переходим в `S3 → cc-lab4-priv-k11 → Management → Create lifecycle rule.`

    ![Img-32](https://imgur.com/WGMiP1B.jpg)

    - Вводим имя правила: `logs-archive_Anya`.  
    - Префикс: `logs/`  
    - В разделе `Lifecycle rule actions` ставим галочки:
      - *Transition current versions of objects between storage classes → Add transition*
      - *Expire current versions of objects → Add expiration*
    - Указываем параметры:
      - *Storage class:* `Standard-IA`
      - *Days after object creation:* `30`
      - *Days after object creation:* `1825`
    - Нажимаем `Create rule`.

    ![Img-33](https://imgur.com/tqgoJg7.jpg)

    ![Img-34](https://imgur.com/8rntITH.jpg)

    ![Img-35](https://imgur.com/TW5ouvu.jpg)

    ![Img-36](https://imgur.com/OxHyKWR.jpg)

    ![Img-37](https://imgur.com/nsXJaFQ.jpg)

8) Создание статического веб-сайта на базе S3
   Создание веб-бакета

    - Переходим в `S3 → Create bucket`.  
    - Указываем:
      - *Имя:* `cc-lab4-web-k11`
      - *Регион:* `eu-central-1`
      - *Object Ownership:* Bucket owner enforced (ACLs disabled)
      - *Block all public access:* отключаем (*снимаем галочку*)
    - Нажимаем `Create bucket`.

    ![Img-38](https://imgur.com/YnSdcv0.jpg)

    ![Img-39](https://imgur.com/fTyy590.jpg)

    Включаем статический хостинг

    - Открываем `S3 → cc-lab4-web-k11 → Properties`.  
    - Внизу находим раздел `Static website hosting.`  
    - Нажимаем `Edit → Enable`.  
    - Указываем:
      - *Hosting type:* `Host a static website`
      - *Index document:* `index.html`
    - Нажимаем `Save changes`.

    ![Img-40](https://imgur.com/X6vnbBg.jpg)

    ![Img-41](https://imgur.com/5kGANu6.jpg)

    ![Img-42](https://imgur.com/8R3bNWE.jpg)

    ![Img-43](https://imgur.com/1f4z0U8.jpg)

    - Копируем файлы веб-сайта в бакет `cc-lab4-web-k11`

    ![Img-44](https://imgur.com/TEAR2hK.jpg)

    - Открываем URL статического сайта, указанный в настройках `S3`.

    ![Img-45](https://imgur.com/K5IXmXF.jpg)

    ![Img-46](https://imgur.com/LHJVnWn.jpg)

---

#### Контрольные вопросы

1) **Чем отличаются два способа управления доступом к бакетам в S3?**
  
    В Amazon S3 есть два основных способа управления доступом:

    - *ACL (Access Control Lists)* — устаревший метод, где права задаются на уровне каждого объекта или бакета (например, конкретный файл можно сделать публичным).

    - *IAM и Bucket Policies* — современный и рекомендуемый способ. Управление доступом выполняется через политики, где задаются разрешения для пользователей, ролей или сервисов AWS.  

    Разница в том, что ACL управляет доступом "локально" для каждого объекта, а IAM/Bucket Policy централизованно регулирует доступ и масштабируется лучше.

2) **Что означает опция “Block all public access” и зачем нужна данная настройка?**

    Эта опция полностью блокирует возможность сделать бакет или его объекты публичными, даже если в политике или ACL прописано разрешение.

    Она используется как *глобальная защита от случайного открытия данных в Интернет*.

    Если опция включена, ни один объект не будет доступен публично, пока её явно не отключат.

3) **Чем отличается ключ (object key) от имени файла?**

    В S3 *object key* — это полный путь к объекту внутри бакета (например, `avatars/user1.jpg`), а *имя файла* — это только последняя часть (`user1.jpg`).

    По сути, ключ определяет уникальное расположение объекта в бакете и заменяет традиционную файловую структуру каталогов.

4) **В чём разница между командами aws s3 cp, mv и sync и для чего используется параметр флаг --acl public-read?**

   - `aws s3 cp` — копирует файлы (локально ↔ S3 или между бакетами).  
   - `aws s3 mv` — перемещает (копирует и удаляет исходный файл).  
   - `aws s3 sync` — синхронизирует содержимое папок, загружая только изменённые или отсутствующие файлы.  
   - Флаг `--acl public-read` делает объект публично доступным для чтения, добавляя ACL-запись, разрешающую всем пользователям доступ к объекту.
  
5) **Что произойдёт, если выключить версионирование после его включения?**
    После отключения версионирования:

    - Новые объекты больше не получают версии (VersionId = null).  
    - Старые версии сохраняются и остаются доступными.  
    - Можно по-прежнему восстанавливать или удалять конкретные старые версии вручную.  

    Таким образом, отключение версионирования не удаляет старые версии, а лишь прекращает их создание.

6) **Что такое Storage Class в Amazon S3 и зачем они нужны?**

   *Storage Class* — это класс хранения, определяющий стоимость и доступность данных.  
   Они позволяют оптимизировать расходы в зависимости от частоты доступа к файлам.  
   Основные типы:
   - *Standard* — для часто используемых данных.  
   - *Standard-IA (Infrequent Access)* — для редко используемых, но важных данных.  
   - *Glacier / Glacier Deep Archive* — для архивов и долгосрочного хранения.  
   - *One Zone-IA* — хранение в одной зоне доступности (дешевле, но менее надёжно).  

   Используя разные классы, можно значительно снизить стоимость хранения данных без потери функциональности.

---

#### Вывод

В результате выполнения лабораторной работы мы познакомились с основными возможностями и функционалом `Amazon S3`, научились создавать и настраивать бакеты различного типа, управлять доступом через `IAM и Bucket Policy`, а также выполнять операции загрузки и организации объектов как через консоль, так и через командную строку `AWS CLI`.
Было изучено применение версионирования, классов хранения и `Lifecycle`-политик, что позволяет эффективно управлять жизненным циклом данных и оптимизировать расходы.
Кроме того, мы освоили настройку `S3 Static Website Hosting`, что продемонстрировало возможность использования S3 не только как хранилища, но и как простого решения для хостинга веб-контента.
Таким образом, цели лабораторной работы были успешно достигнуты.

---

#### Используемые источники

1) [Elearning](https://elearning.usm.md/mod/assign/view.php?id=317871)

2) [Chat-GPT](https://chatgpt.com/)

3) [AWS](https://eu-north-1.signin.aws.amazon.com/oauth?response_type=code&client_id=arn%3Aaws%3Asignin%3A%3A%3Aconsole%2Fcanvas&redirect_uri=https%3A%2F%2Fconsole.aws.amazon.com%2Fconsole%2Fhome%3FhashArgs%3D%2523%26isauthcode%3Dtrue%26state%3DhashArgsFromTB_eu-north-1_d358d9b76aae69ff&forceMobileLayout=0&forceMobileApp=0&code_challenge=QNPqzCbZA50S9D-SelPL1-61GK5Lf3-Mlx1hrXq43jQ&code_challenge_method=SHA-256)
