import type { PreferenciasAparencia } from '@/lib/tema/tipos'

/** Aparência fixa da landing, blog e telas de entrada */
export const PREFERENCIAS_TEMA_PUBLICO: PreferenciasAparencia = {
  modo: 'light',
  temaVisual: 'banana',
}

/** Paths que sempre usam tema institucional claro (não leem prefs do usuário) */
export const PREFIXOS_ROTA_TEMA_CLARO = [
  '/site',
  '/blog',
  '/entrar',
  '/cadastro',
  '/recuperar',
] as const

function pathTemTemaClaro(path: string): boolean {
  if (path === '/') return true

  return PREFIXOS_ROTA_TEMA_CLARO.some(
    (prefixo) => path === prefixo || path.startsWith(`${prefixo}/`),
  )
}

function ehRotaPainel(path: string): boolean {
  return path.startsWith('/adm/') || path.startsWith('/docs/')
}

/** Rotas e hosts que nunca herdam tema escuro salvo no painel */
export function ehRotaPublica(pathname?: string, hostname?: string): boolean {
  const path = pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '/')
  const host = (hostname ?? (typeof window !== 'undefined' ? window.location.hostname : '')).split(':')[0]

  if (ehRotaPainel(path)) return false

  if (pathTemTemaClaro(path)) return true

  const dominioRaiz = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'vigmed.com.br'
  if (host === `blog.${dominioRaiz}`) return true

  return false
}

/** Script inline no <head>; evita flash de tema escuro antes do React */
export function gerarScriptTemaInicial(
  dominioRaiz: string,
  mapaVariaveis: Record<string, { light: Record<string, string>; dark: Record<string, string> }>,
): string {
  const prefixos = JSON.stringify([...PREFIXOS_ROTA_TEMA_CLARO])
  const mapaJson = JSON.stringify(mapaVariaveis)

  return `
(function () {
  try {
    var MAPA = ${mapaJson};

    function aplicarVars(tema, escuro) {
      var pack = MAPA[tema];
      if (!pack) return;
      var vars = escuro ? pack.dark : pack.light;
      var el = document.documentElement;
      for (var k in vars) {
        if (Object.prototype.hasOwnProperty.call(vars, k)) {
          el.style.setProperty(k, vars[k]);
        }
      }
    }

    var path = window.location.pathname;
    var host = window.location.hostname.split(':')[0];
    var root = ${JSON.stringify(dominioRaiz)};
    var prefixos = ${prefixos};
    function pathPainel(p) {
      return p.indexOf('/adm/') === 0 || p.indexOf('/docs/') === 0;
    }

    function pathClaro(p) {
      if (p === '/') return true;
      for (var i = 0; i < prefixos.length; i++) {
        var pref = prefixos[i];
        if (p === pref || p.indexOf(pref + '/') === 0) return true;
      }
      return false;
    }

    var publico = !pathPainel(path) && (pathClaro(path) || host === 'blog.' + root);

    if (publico) {
      document.documentElement.dataset.theme = 'light';
      document.documentElement.dataset.tema = 'banana';
      document.documentElement.classList.remove('dark');
      aplicarVars('banana', false);
      return;
    }

    var legado = localStorage.getItem('fds-theme');
    if (legado && !localStorage.getItem('vigmed-theme')) {
      localStorage.setItem('vigmed-theme', legado);
      localStorage.removeItem('fds-theme');
    }
    var modo = localStorage.getItem('vigmed-theme') || 'system';
    var temaRaw = localStorage.getItem('vigmed-tema-visual') || localStorage.getItem('vigmed-paleta') || 'banana';
    var mapaLegado = {
      azul: 'mirtilo', vigmed: 'mirtilo', mirtilo: 'mirtilo',
      verde: 'limao', floresta: 'limao', kiwi: 'limao', limao: 'limao',
      violeta: 'acai', oceano: 'acai', acai: 'acai', uva: 'acai',
      neutro: 'banana', ardosia: 'banana', figo: 'banana', banana: 'banana'
    };
    var tema = mapaLegado[temaRaw] || temaRaw;
    if (['banana','limao','mirtilo','acai'].indexOf(tema) < 0) tema = 'banana';
    var escuro = modo === 'dark' || (modo !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = escuro ? 'dark' : 'light';
    document.documentElement.dataset.tema = tema;
    document.documentElement.classList.toggle('dark', escuro);
    aplicarVars(tema, escuro);
  } catch (e) {
    document.documentElement.dataset.theme = 'light';
    document.documentElement.dataset.tema = 'banana';
    document.documentElement.classList.remove('dark');
    aplicarVars('banana', false);
  }
})();
`.trim()
}
