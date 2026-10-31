"use client";

import { FormEvent, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { trackMetaEvent } from "@/lib/meta/trackEvent";

export default function ContactForm() {
  const t = useTranslations("Contact");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [botField, setBotField] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const canSubmit = useMemo(() => {
    return (
      name.trim().length > 1 &&
      email.trim().length > 3 &&
      subject.trim().length > 1 &&
      message.trim().length > 3 &&
      status !== "loading"
    );
  }, [name, email, subject, message, status]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setBotField("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
          botField,
        }),
      });

      if (!response.ok) {
        setStatus("error");
        setErrorMessage(t("errorGeneric"));
        return;
      }

      setStatus("success");
      trackMetaEvent("Contact", {
        content_name: "contact_form",
      });
      resetForm();
    } catch {
      setStatus("error");
      setErrorMessage(t("errorGeneric"));
    }
  };

  return (
    <section data-clarity-mask="True" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{t("title")}</h2>
      <p className="mt-2 text-sm text-slate-600">{t("subtitle")}</p>

      <form className="relative mt-6 space-y-4" onSubmit={handleSubmit}>
        <input
          type="text"
          name="botField"
          value={botField}
          onChange={(event) => setBotField(event.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="pointer-events-none absolute -z-50 h-0 w-0 opacity-0"
        />
        <div>
          <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-slate-900">
            {t("fullName")}
          </label>
          <input
            id="contact-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            required
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-slate-900">
            {t("email")}
          </label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            required
          />
        </div>
        <div>
          <label htmlFor="contact-subject" className="mb-1.5 block text-sm font-medium text-slate-900">
            {t("subject")}
          </label>
          <input
            id="contact-subject"
            type="text"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            required
          />
        </div>
        <div>
          <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-slate-900">
            {t("message")}
          </label>
          <textarea
            id="contact-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={6}
            className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            required
          />
        </div>
        {status === "success" ? (
          <p className="text-sm font-medium text-emerald-600">{t("success")}</p>
        ) : null}
        {status === "error" ? (
          <p className="text-sm font-medium text-red-600">{errorMessage}</p>
        ) : null}
        <button
          type="submit"
          disabled={!canSubmit}
          className="h-12 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? t("submitting") : t("submit")}
        </button>
      </form>
    </section>
  );
}
