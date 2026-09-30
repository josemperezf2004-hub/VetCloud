import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/clientes", "/pacientes", "/agenda", "/historia-clinica", "/inventario", "/facturacion", "/configuracion", "/suscripcion", "/plataforma", "/api"],
      },
    ],
    sitemap: "https://saruvet.netlify.app/sitemap.xml",
  };
}
