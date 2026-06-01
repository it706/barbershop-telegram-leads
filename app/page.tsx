"use client";

import { FormEvent, useMemo, useState } from "react";

const services = [
  {
    name: "Мужская стрижка",
    price: "2 200 ₽",
    time: "45 мин",
    description: "Консультация, стрижка, мытье головы и финальная укладка.",
  },
  {
    name: "Стрижка + борода",
    price: "3 400 ₽",
    time: "75 мин",
    description: "Полный визит: форма стрижки, борода, контуры и уход.",
    featured: true,
  },
  {
    name: "Стрижка NordCut",
    price: "3 999 ₽",
    time: "60 мин",
    description: "Стрижка у топ-барбера с детальной консультацией и укладкой.",
    premium: true,
  },
  {
    name: "Королевское бритье",
    price: "1 900 ₽",
    time: "40 мин",
    description: "Горячее полотенце, опасная бритва, уход после бритья.",
  },
  {
    name: "Оформление бороды",
    price: "1 400 ₽",
    time: "30 мин",
    description: "Форма, контуры, масло и аккуратный финиш без лишнего блеска.",
  },
];

const masters = [
  {
    name: "Дмитрий",
    level: "Топ-барбер",
    focus: "Классические стрижки, деловой образ, борода",
    nextSlot: "Сегодня 18:30",
  },
  {
    name: "Артем",
    level: "Барбер по коротким формам",
    focus: "Короткие стрижки, четкие переходы, аккуратный контур",
    nextSlot: "Завтра 12:00",
  },
  {
    name: "Максим",
    level: "Барбер по стилю",
    focus: "Средняя длина, укладка, подбор формы под образ",
    nextSlot: "Завтра 16:45",
  },
];

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  const normalized = digits.startsWith("8") ? `7${digits.slice(1)}` : digits;
  const parts = normalized.match(/^(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})$/);

  if (!parts) return digits;

  const [, country, code, first, second, third] = parts;
  let result = country ? `+${country}` : "";

  if (code) result += ` ${code}`;
  if (first) result += ` ${first}`;
  if (second) result += `-${second}`;
  if (third) result += `-${third}`;

  return result;
}

function openPicker(input: HTMLInputElement) {
  try {
    input.showPicker?.();
  } catch {
    // Some browsers only allow showPicker during a direct user gesture.
  }
}

export default function Home() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("Стрижка + борода");
  const [master, setMaster] = useState("Любой мастер");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const phoneDigits = useMemo(() => phone.replace(/\D/g, ""), [phone]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");

    if (!name.trim()) {
      setStatus("Введите имя.");
      return;
    }

    if (phoneDigits.length !== 11) {
      setStatus("Телефон должен содержать ровно 11 цифр.");
      return;
    }

    if (!bookingDate || !bookingTime) {
      setStatus("Выберите дату и время записи.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          phone,
          service,
          master,
          bookingDate,
          bookingTime,
        }),
      });

      if (!response.ok) {
        throw new Error("Lead request failed");
      }

      setStatus("Заявка отправлена. Администратор свяжется с вами в течение 15 минут.");
      setName("");
      setPhone("");
      setService("Стрижка + борода");
      setMaster("Любой мастер");
      setBookingDate("");
      setBookingTime("");
    } catch {
      setStatus("Не удалось отправить заявку. Попробуйте еще раз или позвоните нам.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function chooseService(value: string) {
    setService(value);
    document.querySelector("#booking")?.scrollIntoView({ behavior: "smooth" });
  }

  function chooseMaster(value: string) {
    setMaster(value);
    document.querySelector("#booking")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main>
      <header className="header">
        <div className="brandBlock">
          <a className="logo" href="#top">
            NordCut
          </a>
          <span>Москва, Патриаршие · Малая Бронная, 24 · 10:00-22:00</span>
        </div>
        <nav aria-label="Навигация">
          <a href="#services">Услуги</a>
          <a href="#barbers">Барберы</a>
          <a href="#booking">Запись</a>
        </nav>
        <a className="phone" href="tel:+79990000000">
          +7 999 000-00-00
        </a>
      </header>

      <section className="hero" id="top">
        <div className="heroPanel">
          <p className="eyebrow">NordCut · мужской зал</p>
          <h1>Запись к барберу без звонков и ожидания</h1>
          <p>
            Выберите услугу, мастера, дату и время. Мы подтвердим запись в Telegram и подготовим
            мастера к вашему визиту заранее.
          </p>
          <div className="heroActions">
            <a className="button primary" href="#booking">
              Записаться онлайн
            </a>
            <a className="button ghost" href="#services">
              Смотреть прайс
            </a>
          </div>
          <div className="heroMetrics" aria-label="Показатели барбершопа">
            <span>
              <strong>3</strong>
              барбера на смене
            </span>
            <span>
              <strong>15 мин</strong>
              подтверждение записи
            </span>
            <span>
              <strong>10:00-22:00</strong>
              каждый день
            </span>
          </div>
        </div>

        <aside className="bookingPreview" aria-label="Ближайшая запись">
          <span>Ближайшее окно</span>
          <strong>18:30</strong>
          <p>Сегодня · Дмитрий · Стрижка + борода</p>
          <button className="button primary full" onClick={() => chooseMaster("Дмитрий")} type="button">
            Забронировать
          </button>
        </aside>
      </section>

      <section className="quickInfo" aria-label="Информация">
        <span>Патриаршие пруды</span>
        <span>Ежедневно 10:00-22:00</span>
        <span>3 барбера сегодня на смене</span>
        <span>Подтверждение записи в Telegram</span>
      </section>

      <section className="section priceSection" id="services">
        <div className="sectionTitle">
          <p className="eyebrow">Прайс</p>
          <h2>Выберите услугу</h2>
        </div>
        <div className="priceList">
          {services.map((item) => (
            <button
              className={`priceRow ${item.featured ? "featured" : ""} ${item.premium ? "premium" : ""}`}
              key={item.name}
              onClick={() => chooseService(item.name)}
              type="button"
            >
              <span className="priceTime">{item.time}</span>
              <span className="priceText">
                <strong>{item.name}</strong>
                <small>{item.description}</small>
              </span>
              <b>{item.price}</b>
            </button>
          ))}
        </div>
      </section>

      <section className="section barberSection" id="barbers">
        <div className="sectionTitle">
          <p className="eyebrow">Барберы</p>
          <h2>Запишитесь к мастеру</h2>
        </div>
        <div className="barberGrid">
          {masters.map((item) => (
            <button className="barberCard" key={item.name} onClick={() => chooseMaster(item.name)} type="button">
              <span className="barberLevel">{item.level}</span>
              <strong>{item.name}</strong>
              <small>{item.focus}</small>
              <em>{item.nextSlot}</em>
            </button>
          ))}
        </div>
      </section>

      <section className="booking" id="booking">
        <div className="bookingCopy">
          <p className="eyebrow">Онлайн-запись</p>
          <h2>Подберем окно под ваш день</h2>
          <p className="muted">
            Оставьте контакты и желаемое время. Администратор уточнит свободные окна и подтвердит
            запись удобным способом.
          </p>
          <div className="bookingSteps" aria-label="Как работает запись">
            <span>01 Вы выбираете услугу</span>
            <span>02 Мы проверяем расписание</span>
            <span>03 Подтверждаем запись</span>
          </div>
          <div className="footerInfo" aria-label="Адрес и режим работы">
            <span>Москва, Патриаршие · Малая Бронная, 24</span>
            <span>Ежедневно 10:00-22:00</span>
          </div>
        </div>

        <form className="leadForm" onSubmit={handleSubmit}>
          <label>
            Имя
            <input onChange={(event) => setName(event.target.value)} placeholder="Иван" type="text" value={name} />
          </label>
          <label>
            Телефон
            <input
              inputMode="tel"
              onChange={(event) => setPhone(formatPhone(event.target.value))}
              placeholder="+7 999 000-00-00"
              type="tel"
              value={phone}
            />
          </label>
          <label>
            Услуга
            <select onChange={(event) => setService(event.target.value)} value={service}>
              {services.map((item) => (
                <option key={item.name}>{item.name}</option>
              ))}
            </select>
          </label>
          <label>
            Мастер
            <select onChange={(event) => setMaster(event.target.value)} value={master}>
              <option>Любой мастер</option>
              {masters.map((item) => (
                <option key={item.name}>{item.name}</option>
              ))}
            </select>
          </label>
          <div className="dateTimeGroup">
            <label>
              Дата
              <input
                className="pickerInput"
                onChange={(event) => setBookingDate(event.target.value)}
                onPointerDown={(event) => openPicker(event.currentTarget)}
                type="date"
                value={bookingDate}
              />
            </label>
            <label>
              Время
              <input
                className="pickerInput"
                onChange={(event) => setBookingTime(event.target.value)}
                onPointerDown={(event) => openPicker(event.currentTarget)}
                type="time"
                value={bookingTime}
              />
            </label>
          </div>
          <button className="button primary full" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Отправляем..." : "Отправить заявку"}
          </button>
          <p className="status" role="status">
            {status}
          </p>
        </form>
      </section>
    </main>
  );
}
