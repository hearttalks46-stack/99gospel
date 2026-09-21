import Image from "next/image";
import ContactForm from "./components/ContactForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0b1220] text-zinc-100">
      <header className="relative isolate min-h-[70vh] overflow-hidden">
        <Image
          src="/hero-blockchain-security.jpg"
          alt="Blockchain network with a gold-edged security shield and padlock"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1220] via-[#0b1220]/75 to-[#0b1220]/25" />
        <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-5xl flex-col justify-center px-6 py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
            Blockchain network security
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">
            Shield your assets with protected blockchain infrastructure
          </h1>
          <p className="mt-5 max-w-xl text-lg text-zinc-200">
            Monitoring, encryption, and network defense for teams that need
            their client data and on-chain operations kept safe.
          </p>
          <a
            href="#contact"
            className="mt-8 inline-flex h-12 w-fit items-center rounded-lg bg-amber-400 px-6 font-semibold text-black transition hover:bg-amber-300"
          >
            Talk to our team
          </a>
        </div>
      </header>

      <main
        id="contact"
        className="mx-auto grid max-w-5xl gap-10 px-6 py-16 lg:grid-cols-[1fr_1.1fr] lg:items-start"
      >
        <section className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
            Contact
          </p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Send your details to our business inbox
          </h2>
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
