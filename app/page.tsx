import type { Metadata } from "next";
import Link from "next/link";

import styles from "./landing.module.css";

const EMAIL_CONTACTO = "vetcloud.ec@yahoo.com";
const WHATSAPP_URL = "https://wa.me/593967063982";
const WHATSAPP_LABEL = "+593 96 706 3982";

export const metadata: Metadata = {
  title: "VetCloud — Tu clínica, organizada de principio a fin",
  description:
    "Software de gestión para clínicas veterinarias: clientes, pacientes, agenda, historia clínica, inventario y facturación en un solo lugar.",
};

export default function LandingPage() {
  return (
    <div className={styles.landingRoot}>
      <div className={styles.wrap}>
        <div className={styles.topbar}>
          <div className={styles.brand}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="16" r="3.2" />
              <circle cx="6" cy="8" r="1.6" />
              <circle cx="18" cy="8" r="1.6" />
              <circle cx="9.5" cy="5" r="1.6" />
              <circle cx="14.5" cy="5" r="1.6" />
            </svg>
            VetCloud
          </div>
          <Link className={styles.ctaMini} href="/register">Quiero probarlo</Link>
        </div>

        <div className={styles.hero}>
          <div className={styles.heroInner}>
            <div>
              <span className={styles.eyebrow}><span className={styles.dot} />Software para clínicas veterinarias</span>
              <h1>Tu clínica, <em>organizada</em> de principio a fin</h1>
              <p className={styles.sub}>
                Historias clínicas, agenda, inventario y facturación en un solo
                lugar. Sin papeles, sin planillas sueltas, sin depender de la
                memoria de nadie. Se abre desde cualquier navegador, en la
                computadora de recepción o desde el celular.
              </p>
              <div className={styles.heroActions}>
                <a className={styles.btnPrimary} href="#funciones">Ver qué incluye</a>
                <Link className={styles.btnGhost} href="/register">Solicitar acceso</Link>
              </div>
            </div>

            <div className={styles.mock}>
              <span className={styles.mockGlow}>Hoy en tu clínica</span>
              <div className={styles.mockHead}>
                <span className={styles.who}>Buenos días, Dra. Torres</span>
                <span className={styles.when}>Vie 19 sep</span>
              </div>
              <div className={styles.mockStats}>
                <div className={styles.mstat}><div className={styles.n}>8</div><div className={styles.l}>Citas hoy</div></div>
                <div className={styles.mstat}><div className={styles.n}>$245</div><div className={styles.l}>Ventas hoy</div></div>
                <div className={`${styles.mstat} ${styles.warn}`}><div className={styles.n}>3</div><div className={styles.l}>Stock bajo</div></div>
              </div>
              <div className={styles.mockRow}><span className={styles.tag}>Vacuna</span> Rocky · González <span className={styles.time}>10:30</span></div>
              <div className={styles.mockRow}><span className={styles.tag}>Consulta</span> Mia · Pérez <span className={styles.time}>11:00</span></div>
              <div className={styles.mockRow}><span className={styles.tag}>Control</span> Toby · Ramos <span className={styles.time}>11:45</span></div>
            </div>
          </div>
        </div>

        <section className={styles.section} id="problema">
          <div className={styles.sectionHead}>
            <div className={styles.sectionKicker}>El problema de siempre</div>
            <h2>Cada clínica termina inventando su propio sistema</h2>
            <p>Una libreta para los turnos, un WhatsApp para recordar a los clientes, una planilla de Excel para el stock. Funciona, hasta que algo se pierde.</p>
          </div>
          <div className={styles.painGrid}>
            <div className={styles.painCard}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
              <h3>Turnos que se pisan</h3>
              <p>Dos citas agendadas a la misma hora con el mismo veterinario, y nadie se da cuenta hasta que llegan los dos clientes juntos.</p>
            </div>
            <div className={styles.painCard}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /></svg>
              <h3>Historias clínicas dispersas</h3>
              <p>La ficha de la mascota está en una carpeta, en otra sucursal, o directamente no quedó anotada nada de la última consulta.</p>
            </div>
            <div className={styles.painCard}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /></svg>
              <h3>Stock que se acaba sin aviso</h3>
              <p>Un medicamento se receta y nadie descontó el stock a mano — hasta que un día, en plena consulta, no queda ni una unidad.</p>
            </div>
          </div>
        </section>

        <section className={styles.section} id="funciones">
          <div className={styles.sectionHead}>
            <div className={styles.sectionKicker}>Todo en un solo lugar</div>
            <h2>Lo que VetCloud hace por tu clínica</h2>
            <p>Áreas conectadas entre sí: lo que cargás en una, aparece automáticamente en las demás.</p>
          </div>
          <div className={styles.featGrid}>
            <div className={styles.featCard}>
              <div className={styles.featIcon}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg></div>
              <h3>Panel de control</h3>
              <p>Citas del día, ventas, stock bajo y clientes nuevos, de un vistazo apenas entrás. Sin tener que sumar nada a mano.</p>
            </div>
            <div className={styles.featCard}>
              <div className={styles.featIcon}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /></svg></div>
              <h3>Clientes y mascotas</h3>
              <p>Ficha completa de cada dueño y cada mascota: contacto, historial y alertas de alergias, siempre a mano.</p>
            </div>
            <div className={styles.featCard}>
              <div className={styles.featIcon}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg></div>
              <h3>Agenda inteligente</h3>
              <p>Calendario semanal por veterinario que avisa solo si dos turnos se superponen. Nunca más un choque de horarios.</p>
            </div>
            <div className={styles.featCard}>
              <div className={styles.featIcon}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M9 13h6M9 17h6" /></svg></div>
              <h3>Historia clínica digital</h3>
              <p>Consultas con el formato que ya usa cualquier veterinario, prescripciones incluidas, y descuento de stock automático.</p>
            </div>
            <div className={styles.featCard}>
              <div className={styles.featIcon}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /></svg></div>
              <h3>Inventario controlado</h3>
              <p>Alertas de stock bajo, entradas y salidas registradas, y el valor total del inventario siempre actualizado.</p>
            </div>
            <div className={styles.featCard}>
              <div className={styles.featIcon}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16l3-2 3 2 3-2 3 2V4a2 2 0 0 0-2-2Z" /><path d="M9 8h6M9 12h6M9 16h3" /></svg></div>
              <h3>Caja / Facturación simple</h3>
              <p>Generá un recibo por consulta en un clic, con numeración automática y control de qué está pagado y qué no.</p>
            </div>
          </div>
        </section>

        <section className={styles.section} id="como-empieza">
          <div className={styles.stepsBand}>
            <div className={styles.sectionHead} style={{ marginBottom: 0 }}>
              <div className={styles.sectionKicker}>Empezar es rápido</div>
              <h2>De cero a atendiendo, en tres pasos</h2>
            </div>
            <div className={styles.stepsGrid}>
              <div className={styles.step}>
                <div className={styles.num}>1</div>
                <h3>Registrás tu clínica</h3>
                <p>Nombre, contacto y tu cuenta de administrador. Sin instalar nada.</p>
              </div>
              <div className={styles.step}>
                <div className={styles.num}>2</div>
                <h3>Cargás clientes y mascotas</h3>
                <p>A tu ritmo, uno por uno, o de una vez importando un Excel.</p>
              </div>
              <div className={styles.step}>
                <div className={styles.num}>3</div>
                <h3>Empezás a atender</h3>
                <p>Agenda, historia clínica, inventario y facturación, ya conectados entre sí.</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section} id="numeros">
          <div className={styles.strip}>
            <div className={styles.item}><div className={styles.v}>6+</div><div className={styles.l}>Módulos conectados</div></div>
            <div className={styles.item}><div className={styles.v}>100%</div><div className={styles.l}>En la nube</div></div>
            <div className={styles.item}><div className={styles.v}>0</div><div className={styles.l}>Instalaciones necesarias</div></div>
            <div className={styles.item}><div className={styles.v}>24/7</div><div className={styles.l}>Acceso desde cualquier lugar</div></div>
          </div>
        </section>

        <section className={styles.section} id="contacto">
          <div className={styles.ctaBand}>
            <h2>Dejá de administrar tu clínica a mano</h2>
            <p>VetCloud reúne clientes, mascotas, agenda, historia clínica, inventario y facturación en un solo sistema.</p>
            <Link className={styles.btnPrimary} href="/register">Registrar mi clínica</Link>
            <div className={styles.ctaContacto}>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp: {WHATSAPP_LABEL}</a>
              <a href={`mailto:${EMAIL_CONTACTO}`}>{EMAIL_CONTACTO}</a>
            </div>
          </div>
        </section>

        <footer className={styles.footer}>
          <span>VetCloud — gestión veterinaria en la nube</span>
          <span>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">{WHATSAPP_LABEL}</a>
            {" · "}
            <a href={`mailto:${EMAIL_CONTACTO}`}>{EMAIL_CONTACTO}</a>
          </span>
        </footer>
      </div>
    </div>
  );
}
