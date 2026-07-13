/** @type {import('next').NextConfig} */
const nextConfig = {
  // 301-redirects fra de gamle lottoresultater.no-adressene til de nye sidene.
  // Hvert hopp går DIREKTE til endelig adresse (ingen kjeder), og matcher tema.
  // Aktiveres når appen kjører på lottoresultater.no (se migreringssjekklisten).
  async redirects() {
    return [
      { source: "/forside", destination: "/", permanent: true },

      { source: "/lotto-resultater", destination: "/lotto", permanent: true },
      { source: "/lottotrekning", destination: "/lotto", permanent: true },

      { source: "/joker-resultater", destination: "/joker", permanent: true },

      { source: "/viking-lottotrekning", destination: "/vikinglotto", permanent: true },
      { source: "/viking-lottotrekning-2", destination: "/vikinglotto", permanent: true },
      { source: "/lottoresultater-viking-lotto", destination: "/vikinglotto", permanent: true },

      { source: "/extra-trekning", destination: "/extra", permanent: true },

      // Historien om lotto → den gjenskapte artikkelen (ekte motpart nå)
      { source: "/lottoresultater-historien-om-lotto-i-norge", destination: "/artikkel/historien-om-lotto-i-norge", permanent: true },

      // Kontakt → Om oss (ekte, relevant motpart nå)
      { source: "/kontakt", destination: "/om-oss", permanent: true },

      // Uten ny motpart → forsiden
      { source: "/powerball-resultater", destination: "/", permanent: true },

      // MERK: /eurojackpot/ hadde samme adresse før og nå — ingen redirect nødvendig.
    ];
  },
};

export default nextConfig;
