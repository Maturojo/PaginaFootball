import { useEffect, useMemo, useState } from 'react';
import api from '../api';
import { API_URL } from '../config.js';

const FALLBACK_TITLE = 'Historia';
const FALLBACK_SUBTITLE = 'De las primeras prácticas en Parque Camet a una comunidad con flag masculino, flag femenino y football equipado.';
const FALLBACK_BACKGROUND = '/historia/fondo-historia.jpg';

const FALLBACK_TEXT = `El desarrollo del Fútbol Americano en la ciudad de Mar del Plata es un proceso reciente, caracterizado por un crecimiento sostenido a partir de iniciativas locales y un fuerte componente comunitario. Fútbol Americano Mar del Plata nació en 2016 cuando un grupo de jóvenes empezaron con las primeras prácticas deportivas en Parque Camet. Estas primeras convocatorias, organizadas de manera independiente, lograron reunir rápidamente a un número significativo de participantes, evidenciando el interés existente y el potencial de desarrollo del deporte a nivel local.

A partir de esta base inicial, hacia los años 2016 y 2017 se produjo un punto de inflexión con la conformación de una estructura organizativa más formal. En este período se establecieron los primeros equipos locales y se dio origen a una liga incipiente en la modalidad Flag Football 7vs7 (un híbrido entre deporte con contacto y sin contacto), lo que permitió el pasaje de una práctica recreativa a un esquema deportivo competitivo. Asimismo, se conformaron representativos de la ciudad para participar en encuentros y competencias interurbanas, viajando a jugar contra equipos de Buenos Aires, Santa Fé y Concepción del Uruguay. En esa época se jugaban los partidos en Parque Camet y también en INAREPS.

En paralelo, el crecimiento del Flag Football en la modalidad 5vs5 en los últimos años a nivel mundial —modalidad sin contacto del fútbol americano— resultó fundamental para la expansión de la disciplina. El flag football ha sido incorporado al programa olímpico para los Juegos Olímpicos de Los Ángeles 2028, lo que ha impulsado su crecimiento global. Su carácter inclusivo, dinámico y de menor requerimiento en cuanto a equipamiento facilitó la incorporación de nuevos practicantes.

A nivel nacional, FAARG (Fútbol Americano Argentina) creció institucionalmente recibiendo el reconocimiento de IFAF (International Federation of American Football), organización similar a FIBA que nuclea la competencia nacional y hoy olímpica de todas las modalidades del deporte fuera de EEUU. Este reconocimiento como institución deportiva permitió hace ya 3 años que Argentina compita como Selección en torneos Sudamericanos (medalla de plata, Brasil 2022), Continentales (5to puesto, Charlotte, EEUU, 2023; fase de grupos, Panamá 2025) y mundiales (puesto 27, Finlandia 2024). En 2026, la selección masculina juvenil obtuvo la medalla de bronce en los Juegos Suramericanos de la Juventud (Panamá 2026). Actualmente, el equipo nacional gestionado por la Federación Argentina de Football Americano (FAARG) continúa su preparación con el objetivo de clasificar al Campeonato Mundial IFAF 2026 en Alemania, que será clave para el proceso hacia los Juegos Olímpicos de Los Ángeles 2028.

Es importante destacar que el capitán de la Selección Argentina es Inti Sellares, jugador marplatense que hace varios años se fue a vivir a Buenos Aires y además compite en la modalidad equipados 11 vs 11, saliendo Novato Ofensivo 2 del Año, y MVP de la temporada 2 veces, consiguiendo el título de liga tras 15 años con el equipo de Legionarios.

Luego de la pandemia (2020), el fútbol americano en Mar del Plata continuó su proceso de consolidación trasladando su competencia local a la modalidad 5vs5 realizándose a la fecha 9 torneos locales, en el que participan 4 equipos. Este crecimiento se vio acompañado por una incorporación constante de jugadores, la formación de entrenadores, la participación en competencias regionales y nacionales en esta modalidad, la progresiva institucionalización de la actividad, la articulación de espacios de entrenamiento, organización de torneos y vinculación con ámbitos educativos y deportivos de la ciudad. Desde la pandemia a hoy, se ha jugado en Club Biguá, Parque Camet, el predio deportivo UNMDP y hoy el Centro Naval a través del CASI MDQ.

La modalidad Flag Football 5vs5 masculina se consolidó como puerta de entrada al deporte y base formativa para la aparición de otras dos modalidades en 2025, el fútbol americano equipado y el flag football femenino. La modalidad femenina se encuentra hoy en auge, participando por primera vez la selección argentina en el Continental de Panamá 2025. A nivel local existen hoy 3 equipos, Nereidas, Selección Marplatense, junto a Sirenas y Gaviotas como equipos locales.

En cuanto a la modalidad equipado, que puede jugarse en las modalidades 7vs7, 9vs9 y 11vs11 (NFL), en 2024 se realizó una Clínica en Córboba de la modalidad organizada por CFA (Córdoba Fútbol Americano) y la ISF (International Sports Federation), en la que se donaron los primeros cascos y hombreras para poder entrenar la modalidad. En 2025 se firmó un convenio con AEFA (Asociación Entrerriana de Football Americano), en la que dio en consignación varios equipamientos necesarios para la práctica. Sumado a algunas inversiones realizadas por FAMDQ, hoy hay 3 equipos, Atlantes, Selección Marplatense, junto con Bárbaros y Templarios como equipos locales.

En 2023 FAMDQ se estableció como Asociación Civil como club de barrio. Cabe agregar que FAMDQ ha organizado 2 torneos Nacionales (2023, 2024) MDQ Open recibiendo jugadores de todo el país. Hoy felizmente contamos con 3 modalidades de entrenamiento: Football Equipado, Flag Football Masculino y Flag Football Femenino, en el que participan aproximadamente 60 personas en total de diferentes edades.`;

const HIGHLIGHTS = [
  ['2016', 'Primeras prácticas en Parque Camet'],
  ['2017', 'Primeros equipos y liga local 7vs7'],
  ['2020+', 'Consolidación de la competencia 5vs5'],
  ['2023', 'FAMDQ se establece como Asociación Civil'],
  ['2025', 'Nacen las modalidades femenina y equipada'],
  ['Hoy', '3 modalidades y una comunidad de 60 personas'],
];

const STATS = [
  ['2016', 'Inicio'],
  ['3', 'Modalidades'],
  ['9+', 'Torneos locales'],
  ['60+', 'Participantes'],
];

function imageSrc(src) {
  if (!src) return FALLBACK_BACKGROUND;
  if (src.startsWith('/historia')) return src;
  return src.startsWith('/') ? `${API_URL}${src}` : src;
}

const SECTION_STARTS = [
  ['A partir de esta base inicial', 'Primeros equipos y competencia'],
  ['En paralelo, el crecimiento', 'Flag Football 5vs5'],
  ['A nivel nacional', 'Argentina en el mapa internacional'],
  ['Es importante destacar', 'Un referente marplatense'],
  ['Luego de la pandemia', 'Consolidación local'],
  ['La modalidad Flag Football 5vs5 masculina', 'Nuevas modalidades'],
  ['En cuanto a la modalidad equipado', 'Football equipado'],
  ['En 2023 FAMDQ', 'Asociación Civil y presente'],
];

function normalizeHistoriaText(text) {
  return String(text || FALLBACK_TEXT)
    .replace(/^\s*HISTORIA\s*/i, '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function normalizeTitle(value) {
  const title = String(value || '').trim();
  if (!title) return FALLBACK_TITLE;
  if (title.length > 90 || title.includes('\n')) return FALLBACK_TITLE;
  return title;
}

function splitBySectionStarts(text) {
  const normalized = normalizeHistoriaText(text);
  const markers = SECTION_STARTS
    .map(([marker, title]) => ({ marker, title, index: normalized.indexOf(marker) }))
    .filter(item => item.index > 0)
    .sort((a, b) => a.index - b.index);

  if (markers.length === 0) {
    return normalized.split(/\n{2,}/).map((body, index) => ({
      title: index === 0 ? 'Historia' : '',
      body: body.trim(),
    })).filter(section => section.body);
  }

  const sections = [{
    title: 'Orígenes en Parque Camet',
    body: normalized.slice(0, markers[0].index).trim(),
  }];

  markers.forEach((marker, index) => {
    const next = markers[index + 1]?.index ?? normalized.length;
    sections.push({
      title: marker.title,
      body: normalized.slice(marker.index, next).trim(),
    });
  });

  return sections.filter(section => section.body);
}

export default function Historia() {
  const [data, setData] = useState({
    titulo: FALLBACK_TITLE,
    subtitulo: FALLBACK_SUBTITLE,
    texto: FALLBACK_TEXT,
    imagen: '',
  });

  useEffect(() => {
    api.get('/pages/historia')
      .then(r => {
        const contenido = r.data?.contenido;
        if (!contenido) return;
        const title = normalizeTitle(contenido.titulo);
        setData({
          titulo: title,
          subtitulo: contenido.subtitulo || FALLBACK_SUBTITLE,
          texto: contenido.texto || FALLBACK_TEXT,
          imagen: contenido.imagen || '',
        });
      })
      .catch(() => {});
  }, []);

  const sections = useMemo(
    () => splitBySectionStarts(data.texto || FALLBACK_TEXT),
    [data.texto],
  );

  const backgroundImage = imageSrc(data.imagen);

  return (
    <div className="bg-primary text-white pt-16 overflow-hidden">
      <section
        className="relative min-h-[76vh] flex items-end bg-secondary"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(5, 10, 18, 0.95) 0%, rgba(9, 18, 31, 0.86) 48%, rgba(9, 18, 31, 0.52) 100%), url(${backgroundImage})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_30%,rgba(83,149,211,0.24),transparent_36%)]" />
        <div className="relative max-w-6xl mx-auto w-full px-4 py-16 md:py-24">
          <p className="text-accent font-bold uppercase tracking-[0.32em] text-sm mb-5">Fútbol Americano Mar del Plata</p>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-none max-w-3xl">{data.titulo || FALLBACK_TITLE}</h1>
          <p className="text-white/72 text-lg md:text-xl leading-relaxed max-w-3xl mt-7">
            {data.subtitulo || FALLBACK_SUBTITLE}
          </p>
        </div>
      </section>

      <section className="border-b border-accent/10 bg-primary">
        <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-3">
          {STATS.map(([value, label]) => (
            <div key={label} className="border border-accent/20 bg-secondary/70 rounded-lg px-5 py-5 text-center">
              <p className="text-3xl md:text-4xl font-extrabold text-accent">{value}</p>
              <p className="text-white/58 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16 md:py-20 grid lg:grid-cols-[320px_1fr] gap-12">
        <aside className="lg:sticky lg:top-28 h-fit">
          <h2 className="text-3xl font-extrabold">Línea de tiempo</h2>
          <div className="w-16 h-1 bg-accent mt-4 rounded" />
          <div className="mt-8 border-l border-accent/30 pl-6 space-y-7">
            {HIGHLIGHTS.map(([year, text]) => (
              <div key={year} className="relative">
                <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-accent shadow-[0_0_0_6px_rgba(83,149,211,0.14)]" />
                <p className="text-accent font-extrabold">{year}</p>
                <p className="text-white/68 text-sm leading-relaxed mt-1">{text}</p>
              </div>
            ))}
          </div>
        </aside>

        <article className="space-y-8">
          {sections.map((section, index) => (
            <section
              key={index}
              className="border-b border-white/8 pb-8 last:border-b-0"
            >
              {section.title && <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">{section.title}</h2>}
              <div className="space-y-4">
                {section.body.split(/\n{2,}/).map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex} className="text-white/76 text-base md:text-lg leading-8">{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </article>
      </section>
    </div>
  );
}
