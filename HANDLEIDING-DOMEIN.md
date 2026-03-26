# Handleiding: Eigen domein koppelen via 123-webhost

**Doel:** `beentelskabaal.nl` laten verwijzen naar de Netlify-website, zodat de domeinnaam zichtbaar blijft in de adresbalk.

**Benodigde tijd:** 15 minuten instellen · 24 uur DNS-propagatie

---

## Stap 1 — Domein toevoegen in Netlify

1. Ga naar [netlify.com](https://netlify.com) en open jouw project
2. Klik op **"Domain management"** in het linkermenu
3. Klik op **"Add a domain"**
4. Vul in: `beentelskabaal.nl` → klik **"Verify"** → klik **"Add domain"**
5. Doe hetzelfde voor `www.beentelskabaal.nl`

Netlify laat nu zien welke DNS-waarden je moet instellen. Houd dit scherm open.

---

## Stap 2 — DNS instellen bij 123-webhost

1. Log in op **[123-webhost.nl](https://123-webhost.nl)**
2. Ga naar **"Mijn domeinen"** → klik op `beentelskabaal.nl`
3. Klik op **"DNS beheren"** of **"Nameservers / DNS"**
4. Voeg de volgende records toe:

### A-record (hoofddomein zonder www)

| Type | Naam | Waarde | TTL |
|------|------|--------|-----|
| A | `@` | `75.2.60.5` | 3600 |

> `@` staat voor het hoofddomein (`beentelskabaal.nl` zonder www)

### CNAME-record (www-variant)

| Type | Naam | Waarde | TTL |
|------|------|--------|-----|
| CNAME | `www` | `beentelskabaal.netlify.app` | 3600 |

> Zorg dat er geen punt achter `beentelskabaal.netlify.app` staat

5. Sla de wijzigingen op

---

## Stap 3 — Wachten op DNS-propagatie

DNS-wijzigingen verspreiden zich over het internet. Dit duurt meestal:

- **Minimaal:** 15 minuten
- **Gemiddeld:** 2–4 uur
- **Maximum:** 24 uur

Controleer de voortgang via [dnschecker.org](https://dnschecker.org) → vul `beentelskabaal.nl` in.

---

## Stap 4 — SSL-certificaat (https) activeren

Zodra DNS actief is, doet Netlify dit automatisch:

1. Netlify detecteert dat het domein klopt
2. Vraagt automatisch een gratis SSL-certificaat aan (Let's Encrypt)
3. De site is bereikbaar via `https://beentelskabaal.nl`

Je hoeft hier niets voor te doen. In het Netlify dashboard onder **"Domain management"** zie je de status — wacht tot er een groen vinkje staat bij het SSL-certificaat.

---

## Stap 5 — Www doorsturen naar hoofddomein (aanbevolen)

Zorg dat `www.beentelskabaal.nl` automatisch doorverwijst naar `beentelskabaal.nl`:

1. Ga in Netlify naar **"Domain management"**
2. Klik bij `www.beentelskabaal.nl` op **"Set as primary domain"** — kies hier `beentelskabaal.nl` (zonder www) als primair
3. Netlify stuurt `www` automatisch door

---

## Wat je ziet na activatie

```
Bezoeker typt: beentelskabaal.nl
    ↓
DNS stuurt door naar Netlify
    ↓
Netlify serveert de website
    ↓
Adresbalk toont: https://beentelskabaal.nl  ✓
```

De adresbalk toont **altijd** `beentelskabaal.nl` — nooit meer `beentelskabaal.netlify.app`.

---

## Veelgestelde vragen

**V: Kan ik het oude 123-webhost hostingpakket gewoon laten staan?**
A: Ja, het domein wijst alleen via DNS naar Netlify. De hosting bij 123-webhost hoef je niet op te zeggen, maar die wordt niet meer gebruikt voor de website.

**V: Werkt het e-mailadres `kabaal@live.nl` nog?**
A: Ja. Dat is een Microsoft Live-adres en staat los van de website. DNS-wijzigingen voor de website hebben daar geen invloed op.

**V: Ik zie nog steeds de netlify.app URL.**
A: DNS-propagatie is nog bezig. Wacht maximaal 24 uur en ververs de pagina. Controleer de voortgang via dnschecker.org.

**V: Er staat een foutmelding over SSL in Netlify.**
A: Klik in Netlify op **"Verify DNS configuration"**. Als de A- en CNAME-records correct zijn ingesteld, lost dit zich automatisch op zodra DNS is verspreid.

---

*Handleiding versie 1.0 – maart 2026*
