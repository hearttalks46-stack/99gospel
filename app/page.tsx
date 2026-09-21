import ContactForm from "./components/ContactForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0b1220] text-zinc-100">
      <main className="mx-auto grid max-w-5xl gap-10 px-6 py-16 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <section className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
            Contact
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Send your details to our business inbox
          </h1>
          <p className="max-w-md text-zinc-300">
            Fill in the form and we email your name, email, phone, company, and
            message to our business mailbox. Reply-To is set to your address so
            we can answer from that inbox.
          </p>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li>No client data is emailed from the browser.</li>
            <li>The server sends mail through your mailbox SMTP settings.</li>
            <li>Set EMAIL_TO to the inbox you want to receive leads.</li>
          </ul>
        </section>
        <ContactForm />
      </main>
    </div>
  );
}
