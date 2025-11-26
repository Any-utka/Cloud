# Тема: Балансирование нагрузки в облаке и авто-масштабирование

> Подготовила: Доцен Анна

---

## Цель работы: Закрепить навыки работы с AWS EC2, Elastic Load Balancer, Auto Scaling и CloudWatch, создав отказоустойчивую и автоматически масштабируемую архитектуру

---

### Этапы выполнения

1) Создание VPC и подсетей
   - Создаем VPC
   - Создаем 2 публичные подсети и 2 приватные подсети в разных зонах доступности:
      - CIDR-блок: `10.0.1.0/24 и 10.0.2.0/24`
   - Создаем Internet Gateway и прикрепляем его к VPC
   - В Route Table прописываем маршрут для публичных подсетей:
       - Destination: 0.0.0.0/0 → Target: Internet Gateway

    ![Img-1](https://imgur.com/pOX4P0v.jpg)
    ![Img-2](https://imgur.com/QkZ4cs1.jpg)
    ![Img-3](https://imgur.com/NpHcmUL.jpg)
    ![Img-4](https://imgur.com/kN8FObH.jpg)

2) Создание и настройка виртуальной машины
   - Запускаем виртуальную машину в созданной подсети:
       - AMI: `Amazon Linux 2`
       - Тип: `t3.micro`
   - В настройках сети выбираем созданную VPC и подсеть
   - В настройках безопасности создаем новую группу безопасности с правилами:
       - Входящие правила:
         - `SSH (порт 22) — источник: наш IP`
         - `HTTP (порт 80) — источник: 0.0.0.0/0`
       - Исходящие правила:
         - `Все трафики — источник: 0.0.0.0/0`
   - В `Advanced Details -> Detailed CloudWatch monitoring` выбираем `Enable`. Это позволит собирать дополнительные метрики для `Auto Scaling`
   - В настройках `UserData` указываем скрипт `init.sh`, который установит, запускаем `nginx`
   - Дождаемся, пока `Status Checks` виртуальной машины станут зелёными `(3/3 checks passed)`
   - Убеждаемся, что веб-сервер работает, подключившись к публичному IP-адресу виртуальной машины через браузер
  
    ![Img-5](https://imgur.com/VuNP3vE.jpg)
    ![Img-6](https://imgur.com/vK2y1iA.jpg)
    ![Img-7](https://imgur.com/1KxTg3U.jpg)
    ![Img-8](https://imgur.com/qiVlfqP.jpg)
    ![Img-9](https://imgur.com/AsJu7Dt.jpg)

3) Создание AMI
   - В EC2 выбираем `Instance → Actions → Image and templates → Create image`
   - Называем AMI, например: `project-web-server-ami`
   - Дождаемся появления AMI в разделе AMIs

    ![Img-10](https://imgur.com/XkeEShd.jpg)

4) Создание Launch Template
   - В разделе EC2 выбираем `Launch Templates → Create launch template`
   - Указываем следующие параметры:
       - Название: `project-launch-template`
       - AMI: выбираем созданную ранее AMI `(My AMIs -> project-web-server-ami)`
       - Тип инстанса: `t3.micro`
       - Security groups: выбираем ту же группу безопасности, что и для виртуальной машины
       - Нажимаем `Create launch template`
       - В разделе `Advanced details -> Detailed CloudWatch monitoring` выбираем `Enable`. Это позволит собирать дополнительные метрики для `Auto Scaling`

    ![Img-11](https://imgur.com/8XBTsaV.jpg)
    ![Img-12](https://imgur.com/5CAyDZF.jpg)
    ![Img-13](https://imgur.com/Kmty213.jpg)
    ![Img-14](https://imgur.com/6QhS8Zm.jpg)

5) Создание Target Group
   - В разделе EC2 выбираем `Target Groups → Create target group`
   - Указываем следующие параметры:
       - Название: `project-target-group`
       - Тип: `Instances`
       - Протокол: `HTTP`
       - Порт: `80`
       - VPC: выбираем созданную VPC
   - Нажимаем `Next -> Next, затем Create target group`

    ![Img-15](https://imgur.com/5lfcLEC.jpg)
    ![Img-16](https://imgur.com/lgRP5Xq.jpg)

6) Создание Application Load Balancer
   - В разделе EC2 выбираем `Load Balancers → Create Load Balancer → Application Load Balancer`
   - Указываем следующие параметры:
       - Название: `project-alb`
       - Scheme: `Internet-facing`
       - Subnets: выбираем созданные 2 публичные подсети
       - Security Groups: выбираем ту же группу безопасности, что и для виртуальной машины
       - Listener: `протокол HTTP, порт 80`
       - Default action: выбираем созданную `Target Group project-target-group`
       - Нажимаем `Create load balancer`
   - Переходим в раздел `Resource map` и убеждаемся, что существуют связи между `Listeners, Rules и Target groups`

    ![Img-17](https://imgur.com/YSlDXKI.jpg)
    ![Img-18](https://imgur.com/DZvE5Z2.jpg)
    ![Img-19](https://imgur.com/6BRA4P0.jpg)
    ![Img-20](https://imgur.com/MYrk5pm.jpg)

7) Создание Auto Scaling Group
   - В разделе EC2 выбираем `Auto Scaling Groups → Create Auto Scaling group`
   - Указываем следующие параметры:
       - Название: `project-auto-scaling-group`
       - Launch template: выбираем созданный ранее `Launch Template (project-launch-template)`
       - Переходим в раздел `Choose instance launch options`
           - В разделе Network: выбираем созданную VPC и две приватные подсети
       - Availability Zone distribution: выбираем `Balanced best effort`
       - Переходим в раздел Integrate with other services и выбираем `Attach to an existing load balancer`, затем выбираем созданную `Target Group (project-target-group)`
         - Таким образом мы добавляем `AutoScaling Group` в `Target Group` нашего `Load Balancer-а`
       - Переходим в раздел `Configure group size and scaling` и указываем:
         - Минимальное количество инстансов: `2`
         - Максимальное количество инстансов: `4`
         - Желаемое количество инстансов: `2`
         - Указываем `Target tracking scaling policy` и настраиваем масштабирование по CPU `(Average CPU utilization — 50% / Instance warm-up period — 60 seconds)`
         - В разделе Additional settings ставим галочку на `Enable group metrics collection within CloudWatch`, чтобы собирать метрики `Auto Scaling Group в CloudWatch.` Этот пункт позволит нам отслеживать состояние группы и её производительность
       - Переходим в раздел Review и нажимаем `Create Auto Scaling group`

    ![Img-21](https://imgur.com/ent5MxS.jpg)
    ![Img-22](https://imgur.com/yhNWrAe.jpg)
    ![Img-23](https://imgur.com/CywVqKg.jpg)
    ![Img-24](https://imgur.com/6km4wvA.jpg)
    ![Img-25](https://imgur.com/Yyx2rt5.jpg)
    ![Img-26](https://imgur.com/G8aTVG4.jpg)

8) Тестирование Application Load Balancer
   - Переходим в раздел `EC2 -> Load Balancers`, выбираем созданный `Load Balancer` и копируем его `DNS-имя`
   - Вставляем `DNS-имя` в браузер и убеждаемся, что видим страницу веб-сервера
   - Обновляем страницу несколько раз и смотрим на IP-адреса в ответах

    ![Img-27](https://imgur.com/Iw5E5Vz.jpg)
    ![Img-28](https://imgur.com/W8EYXLy.jpg)

9) Тестирование Auto Scaling
    - Переходим в `CloudWatch -> Alarms`, должны быть созданы автоматические оповещения для `Auto Scaling Group`
    - Выбираем одно из оповещений, открываем и смотрим на график `CPU Utilization`. На данный момент график должен быть низким (около 0-1%)
    - Переходим в браузер и открываем 6-7 вкладок
    - Возвращаемся в `CloudWatch` и смотрим на график `CPU Utilization`. Через несколько минут должны увидеть рост нагрузки
    - Ждем 2-3 минуты, пока `CloudWatch` не зафиксирует высокую нагрузку и не создаст `Alarm`
    - Переходим в раздел `EC2 -> Instances` и смотрим на количество запущенных инстансов

    ![Img-29](https://imgur.com/3RwuRRd.jpg)
    ![Img-30](https://imgur.com/guyTsZG.jpg)
    ![Img-31](https://imgur.com/8cL5eUW.jpg)

---

#### Контрольные вопросы

1) **Что такое image и чем он отличается от snapshot? Какие есть варианты использования AMI?**

    *AMI* — это шаблон операционной системы с предустановленным ПО и конфигурацией, на основе которого можно запускать новые EC2-инстансы.
    *Snapshot* — это копия диска (EBS тома) в определённый момент времени, содержащая только данные.
    *Основное отличие:* AMI может содержать несколько Snapshot-ов и дополнительные метаданные, необходимые для запуска виртуальной машины (архитектура CPU, launch permissions, параметры root volume). Snapshot сам по себе не может быть запущен как инстанс — он составляет лишь часть AMI.
    *Использование AMI:* быстрое развёртывание одинаковых серверов, создание Auto Scaling Group, резервное копирование системы, миграция окружений, стандартные шаблоны для CI/CD.

2) **Что такое Launch Template и зачем он нужен? Чем он отличается от Launch Configuration?**

    *Launch Template* — это шаблон параметров запуска EC2-инстанса: AMI, тип виртуальной машины, security group, user data, ключи доступа и др.
    Он используется для *Auto Scaling Group, EC2 Fleet и Spot Fleet*. Его главное назначение — стандартизировать и автоматизировать процесс запуска серверов.
    *Отличие от Launch Configuration:*
    *Launch Configuration* — устаревший механизм, который нельзя изменять; он создаётся один раз и immutable.
    *Launch Template* поддерживает версии, позволяет менять параметры без пересоздания, поддерживает намного больше настроек (например, multiple instance types, T2/T3 Unlimited, metadata options). AWS рекомендует использовать только Launch Templates.

3) **Зачем необходим и какую роль выполняет Target Group?**

   *Target Group* — это логическое объединение серверов (EC2-инстансов), к которым Load Balancer направляет трафик. Он выполняет роль точки маршрутизации: в него добавляются инстансы Auto Scaling Group, именно в него Load Balancer отправляет запросы.
   Также *Target Group* обеспечивает проверку состояния (health checks) — если инстанс "здоров", он получает трафик; если нет — исключается. Target Group позволяет гибко управлять направлением запросов и легко подключает новые автоматические инстансы.

4) **В чем разница между Internet-facing и Internal?**

   *Internet-facing Load Balancer* имеет публичный IP-адрес и доступен из интернета.
   *Internal Load Balancer* работает только внутри VPC, имеет приватные IP-адреса и предназначен для внутренних сервисов — микросервисов, баз данных, приватных приложений.
   В лабораторной работе используется Internet-facing ALB, чтобы можно было обращаться к веб-серверу извне.

5) **Что такое Default action и какие есть типы Default action?**

    *Default action* — это действие, которое Listener Load Balancer выполняет, если правило маршрутизации не совпало ни с одним условием.
    Иногда его называют правилом по умолчанию. Основные типы *Default action: forward* (отправить запрос в Target Group), *redirect* (перенаправить на другой URL или HTTPS), *fixed-response* (вернуть фиксированный ответ, например 404 или текстовое сообщение).
    В данной работе Default action — переадресация трафика в Target Group.

6) **Почему для Auto Scaling Group выбираются приватные подсети?**

    Инстансы *Auto Scaling* располагаются в приватных подсетях, потому что они не должны иметь прямого выхода в интернет — доступом к ним управляет Load Balancer.
    Такой подход повышает безопасность: серверы нельзя атаковать напрямую, трафик проходит только через ALB, который выполняет фильтрацию и распределение нагрузки. Это стандартная архитектура AWS — ALB в публичных подсетях принимает запросы, а частные EC2 обрабатывают их внутри VPC.

7) **Зачем нужна настройка: Availability Zone distribution?**

    *Availability Zone distribution* распределяет инстансы Auto Scaling по разным зонам доступности, чтобы обеспечить отказоустойчивость. Если одна зона выйдет из строя или станет перегруженной, инстансы в другой зоне продолжат работать. Balanced best effort обеспечивает равномерное размещение серверов для баланса нагрузки и надёжности.

8) **Что такое Instance warm-up period и зачем он нужен?**

    *Instance warm-up period* — это время, которое AWS Auto Scaling ждёт после запуска нового инстанса, прежде чем учитывать его метрики в расчётах масштабирования.
    Он нужен для того, чтобы инстанс успел запуститься, прогрузить приложение, выполнить User Data и выйти на стабильное состояние.
    Без warm-up Auto Scaling мог бы неверно оценить CPU и выполнить лишнее масштабирование.

9) **Какие IP-адреса вы видите и почему?**

    При обновлении страницы отображаются приватные IP-адреса EC2-инстансов, находящихся в Target Group. Публичный адрес имеет только Load Balancer. Запросы клиента идут на публичный DNS ALB, а он распределяет трафик на приватные EC2. Поэтому в HTML-ответе (например, если сервер выводит свой IP) будут IP из диапазонов приватных подсетей.

10) **Какую роль в этом процессе сыграл Auto Scaling?**

    *Auto Scaling* отреагировал на повышение нагрузки, зафиксированное в CloudWatch через метрику CPU Utilization.
    Когда значение превысило целевой порог (50%), Auto Scaling создал новые инстансы на основе Launch Template и разместил их в приватных подсетях, добавив в Target Group.
    Это позволило равномерно распределить нагрузку и предотвратить деградацию сервиса. После окончания нагрузки Auto Scaling может уменьшить число инстансов, тем самым экономя ресурсы.

---

#### Вывод

В ходе лабораторной работы была развернута отказоустойчивая и автоматически масштабируемая архитектура в AWS с использованием VPC, EC2, Application Load Balancer, Target Group, Auto Scaling Group и CloudWatch. В результате была закреплена практика создания сетевой инфраструктуры, настройки веб-сервера, формирования AMI и Launch Template, интеграции ALB с Auto Scaling, а также тестирования автоматического масштабирования нагрузкой.

---

#### Используемые источники

1) [Elearning](https://elearning.usm.md/mod/assign/view.php?id=322113)

2) [Chat GPT](https://chatgpt.com/)

3) [Amazon](https://eu-north-1.signin.aws.amazon.com/oauth?response_type=code&client_id=arn%3Aaws%3Asignin%3A%3A%3Aconsole%2Fcanvas&redirect_uri=https%3A%2F%2Fconsole.aws.amazon.com%2Fconsole%2Fhome%3FhashArgs%3D%2523%26isauthcode%3Dtrue%26state%3DhashArgsFromTB_eu-north-1_d358d9b76aae69ff&forceMobileLayout=0&forceMobileApp=0&code_challenge=QNPqzCbZA50S9D-SelPL1-61GK5Lf3-Mlx1hrXq43jQ&code_challenge_method=SHA-256)
