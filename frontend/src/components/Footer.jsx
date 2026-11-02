import emecSeal from '@assets/svg/emec-inatel.svg';

const COLUNAS_LINKS = [
  {
    titulo: 'Educação',
    itens: [
      { label: 'Vestibular', href: 'https://inatel.br/vestibular/' },
      {
        label: 'Transferências',
        href: 'https://inatel.br/vestibular/transferencia-e-portador-de-diploma',
      },
      { label: 'Inatel Online - Cursos', href: 'https://online.inatel.br/' },
      { label: 'Mestrado e Doutorado', href: 'https://inatel.br/mestrado-doutorado/' },
      { label: 'Pós-graduação', href: 'https://inatel.br/pos/' },
      { label: 'Treinamentos', href: 'https://inatel.br/treinamento/' },
    ],
  },
  {
    titulo: 'Canais',
    itens: [
      { label: 'Blog', href: 'https://inatel.br/blog/' },
      { label: 'Notícias', href: 'https://inatel.br/noticias/' },
      { label: 'Rádio Educativa', href: 'https://inatel.br/radio/' },
      { label: 'InaTalks', href: 'https://open.spotify.com/show/5VerrYwMqIrA8o3CJD0xtV' },
      {
        label: 'Newsletter',
        href: 'https://www.linkedin.com/newsletters/7100456077468590080/',
      },
    ],
  },
  {
    titulo: 'Acesse',
    itens: [
      { label: 'Imprensa', href: 'https://inatel.br/noticias/sala-de-impresa' },
      { label: 'Intranet', href: 'https://inatel.br/intranet/' },
      { label: 'Ouvidoria', href: 'https://inatel.br/ouvidoria/' },
      { label: 'Carreiras', href: 'https://inatel.br/carreiras/' },
      { label: 'Combate ao assédio', href: 'https://inatel.br/combate-assedio/' },
      {
        label: 'Documentos Institucionais',
        href: 'https://inatel.br/home/documentos-institucionais',
      },
      { label: 'Transparência', href: 'https://inatel.br/finatel/transparencia' },
    ],
  },
];

const REDES_SOCIAIS = [
  {
    nome: 'Facebook',
    href: 'https://pt-br.facebook.com/inatel',
    svg: (
      <svg viewBox="0 0 25 24" className="w-5 h-5 fill-current" aria-hidden="true">
        <path d="M24.146 12.073C24.146 5.40365 18.7424 0 12.073 0C5.40365 0 0 5.40365 0 12.073C0 18.0988 4.41493 23.0935 10.1866 24V15.563H7.11968V12.073H10.1866V9.41306C10.1866 6.3875 11.9878 4.71627 14.7466 4.71627C16.0678 4.71627 17.4494 4.95189 17.4494 4.95189V7.92146H15.9267C14.4273 7.92146 13.9594 8.85225 13.9594 9.8069V12.073H17.3077L16.7723 15.563H13.9594V24C19.7311 23.0935 24.146 18.0988 24.146 12.073Z" />
      </svg>
    ),
  },
  {
    nome: 'Instagram',
    href: 'https://www.instagram.com/inatel.tecnologias',
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
        <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95h-8.5Zm9.65 1.35a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8A3.2 3.2 0 1 0 12 15.2 3.2 3.2 0 0 0 12 8.8Z" />
      </svg>
    ),
  },
  {
    nome: 'YouTube',
    href: 'https://www.youtube.com/channel/UCBB5HfmeAByTUs0XuzFXRew',
    svg: (
      <svg viewBox="0 0 26 18" className="w-5 h-5 fill-current" aria-hidden="true">
        <path d="M24.6207 2.76645C24.3315 1.67751 23.4794 0.819896 22.3975 0.528854C20.4365 0 12.5731 0 12.5731 0C12.5731 0 4.70969 0 2.74863 0.528854C1.66674 0.819946 0.814656 1.67751 0.525454 2.76645C0 4.74021 0 8.85828 0 8.85828C0 8.85828 0 12.9764 0.525454 14.9501C0.814656 16.0391 1.66674 16.8609 2.74863 17.152C4.70969 17.6808 12.5731 17.6808 12.5731 17.6808C12.5731 17.6808 20.4364 17.6808 22.3975 17.152C23.4794 16.8609 24.3315 16.0391 24.6207 14.9501C25.1461 12.9764 25.1461 8.85828 25.1461 8.85828C25.1461 8.85828 25.1461 4.74021 24.6207 2.76645ZM10.0013 12.5972V5.11938L16.5735 8.85837L10.0013 12.5972Z" />
      </svg>
    ),
  },
  {
    nome: 'LinkedIn',
    href: 'https://www.linkedin.com/school/inatel/',
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452z" />
      </svg>
    ),
  },
  {
    nome: 'Flickr',
    href: 'https://www.flickr.com/photos/inatel/albums',
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
        <path d="M21.4286 0H2.57143C1.15179 0 0 1.15179 0 2.57143V21.4286C0 22.8482 1.15179 24 2.57143 24H21.4286C22.8482 24 24 22.8482 24 21.4286V2.57143C24 1.15179 22.8482 0 21.4286 0ZM7.74107 15.375C5.86071 15.375 4.33929 13.8536 4.33929 11.9732C4.33929 10.0929 5.86071 8.57143 7.74107 8.57143C9.62143 8.57143 11.1429 10.0929 11.1429 11.9732C11.1429 13.8536 9.62143 15.375 7.74107 15.375ZM16.2589 15.375C14.3786 15.375 12.8571 13.8536 12.8571 11.9732C12.8571 10.0929 14.3786 8.57143 16.2589 8.57143C18.1393 8.57143 19.6607 10.0929 19.6607 11.9732C19.6607 13.8536 18.1393 15.375 16.2589 15.375Z" />
      </svg>
    ),
  },
];

const LINKS_RODAPE_LEGAL = [
  { label: 'Política de Privacidade', href: 'https://inatel.br/politica-privacidade/' },
  {
    label: 'Declaração de Cookies',
    href: 'https://inatel.br/politica-privacidade/declaracao-de-cookies',
  },
  { label: 'Encarregado da LGPD', href: 'mailto:privacidade@inatel.br' },
  { label: 'Mapa do Site', href: 'https://inatel.br/home/mapa-do-site' },
];

export default function Footer() {
  return (
    <footer className="mt-14 w-full">
      {/* Bloco Principal — Identidade Visual Oficial inatel.br/home/ */}
      <section className="inatel-footer-main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Coluna Institucional (Logo, Endereço, Contatos, Selo e-MEC e Redes Sociais) */}
            <div className="lg:col-span-5 space-y-6">
              <a
                href="https://inatel.br/home/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Inatel — Página Inicial"
                className="inline-block"
              >
                <svg
                  viewBox="100 150 390 116"
                  className="w-32 h-auto fill-white hover:opacity-90 transition"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>Inatel</title>
                  <path d="M127.455,156.988h21.287l-21.859,102.835H105.69L127.455,156.988L127.455,156.988z M225.618,208.048l-10.941,51.775H194.51l9.726-45.911c0.286-1.168,0.477-2.312,0.62-3.456c0.143-1.144,0.214-2.145,0.214-3.027c0-2.86-0.834-4.982-2.527-6.412c-1.668-1.407-4.147-2.122-7.461-2.122c-5.078,0-9.392,1.406-12.968,4.219c-3.552,2.836-5.888,6.698-6.96,11.633l-9.559,45.076h-20.31l16.186-75.946h19.905l-2.002,9.559c3.957-3.886,8.105-6.794,12.491-8.701c4.362-1.907,9.011-2.86,13.945-2.86c6.508,0,11.656,1.501,15.447,4.529c3.79,3.027,5.697,7.151,5.697,12.372c0,1.239-0.096,2.55-0.286,3.933S226.143,205.855,225.618,208.048L225.618,208.048z M282.709,222.636c-3.29,1.455-7.318,2.646-12.038,3.6c-4.744,0.954-7.557,1.55-8.438,1.788c-3.218,0.978-5.674,2.526-7.414,4.648c-1.716,2.122-2.574,4.672-2.574,7.652c0,2.074,0.739,3.719,2.24,4.887c1.478,1.168,3.552,1.74,6.222,1.74c5.078,0,9.487-1.574,13.206-4.721s6.15-7.342,7.271-12.61L282.709,222.636L282.709,222.636z M306.333,202.613l-9.154,43.145c-0.238,1.313-0.405,2.432-0.524,3.361s-0.167,1.717-0.167,2.385c0,1.168,0.167,2.098,0.548,2.789c0.381,0.715,1.049,1.406,2.026,2.098l-0.763,3.432h-21.025c-0.048-0.285-0.143-0.643-0.286-1.119c-0.381-1.813-0.572-3.076-0.572-3.768c0-0.428,0.048-1,0.119-1.715c0.072-0.74,0.167-1.574,0.31-2.551c-3.218,3.861-7.032,6.793-11.49,8.818c-4.458,2.027-9.344,3.053-14.708,3.053c-5.721,0-10.274-1.455-13.659-4.338c-3.361-2.885-5.054-6.771-5.054-11.658c0-9.51,2.574-16.876,7.724-22.097c5.125-5.197,13.206-8.629,24.171-10.25c1.788-0.287,4.195-0.645,7.271-1.049c10.131-1.168,15.185-4.53,15.185-10.108c0-2.098-0.834-3.623-2.527-4.577c-1.669-0.954-4.338-1.43-8.033-1.43c-4.195,0-7.581,0.93-10.131,2.813c-2.574,1.883-4.052,4.529-4.481,7.914h-19.166c1.359-8.2,5.292-14.684,11.824-19.451c6.507-4.768,14.731-7.151,24.672-7.151c8.987,0,15.971,1.454,20.954,4.362s7.484,6.984,7.484,12.205c0,0.834-0.047,1.668-0.143,2.503C306.642,201.063,306.5,201.874,306.333,202.613L306.333,202.613z M335.081,163.281h20.31l-4.338,20.595h12.634l-3.004,14.303h-12.776l-8.844,42.026c0,0.238-0.048,0.547-0.144,0.93c-0.095,0.404-0.144,0.668-0.144,0.811c0,1.119,0.549,1.93,1.67,2.406c1.119,0.502,3.051,0.74,5.792,0.74h4.409l-3.289,15.303c-1.168,0.049-2.717,0.096-4.672,0.145c-3.528,0.094-5.84,0.143-6.913,0.143c-6.508,0-11.18-0.883-14.017-2.646c-2.837-1.787-4.267-4.672-4.267-8.678c0-1.119,0.118-2.455,0.357-4.051c0.214-1.574,0.596-3.6,1.12-6.08l8.701-41.048h-10.752l3.004-14.303h10.895L335.081,163.281L335.081,163.281z M432.339,227.213H383.4c-0.167,1.025-0.311,2.026-0.405,3.004s-0.144,1.835-0.144,2.574c0,4.1,0.978,7.199,2.956,9.297s4.911,3.146,8.772,3.146c3.266,0,6.031-0.668,8.344-1.979c2.313-1.334,4.434-3.48,6.389-6.46h20.309c-3.576,7.962-8.914,14.208-16.018,18.761c-7.105,4.553-14.994,6.842-23.695,6.842c-8.63,0-15.424-2.551-20.43-7.676c-5.006-5.127-7.508-12.016-7.508-20.692c0-6.197,1.096-12.609,3.289-19.236c2.17-6.627,5.077-12.325,8.725-17.092c4.172-5.435,9.059-9.559,14.588-12.348c5.531-2.789,11.633-4.195,18.283-4.195c8.939,0,15.924,2.36,20.955,7.104c5.029,4.72,7.531,11.275,7.531,19.666c0,2.193-0.213,4.696-0.666,7.534C434.246,218.322,433.458,222.232,432.339,227.213L432.339,227.213z M414.46,213.912c0.143-1.119,0.262-2.098,0.334-2.955c0.07-0.858,0.096-1.55,0.096-2.05c0-3.385-0.979-6.031-2.957-7.914s-4.768-2.813-8.344-2.813c-4.146,0-7.676,1.335-10.607,4.005s-5.172,6.579-6.697,11.728H414.46L414.46,213.912z M461.826,156.988h20.311l-21.932,102.835h-20.262L461.826,156.988L461.826,156.988z" />
                </svg>
              </a>

              <address className="not-italic space-y-6 text-[15px] leading-relaxed text-white/95">
                <div className="space-y-1">
                  <p className="font-semibold text-white">
                    Instituto Nacional de Telecomunicações – Inatel
                  </p>
                  <p>Campus em Santa Rita do Sapucaí - MG - Brasil</p>
                  <p>Av. João de Camargo, 510 - Centro - 37536-001</p>
                </div>

                {/* Contatos Diretos + QR Code Oficial e-MEC */}
                <div className="flex flex-wrap items-center gap-6">
                  <div className="space-y-2.5 text-sm sm:text-[15px]">
                    <a
                      href="tel:+553534719200"
                      className="flex items-center gap-2.5 text-white hover:text-[#40d5d9] transition"
                    >
                      <svg
                        viewBox="1 0 24 20"
                        className="w-4 h-4 fill-current shrink-0"
                        aria-hidden="true"
                      >
                        <path d="M16.5562 12.9062L16.1007 13.359C16.1007 13.359 15.0181 14.4355 12.0631 11.4972C9.10812 8.55901 10.1907 7.48257 10.1907 7.48257L10.4775 7.19738C11.1841 6.49484 11.2507 5.36691 10.6342 4.54348L9.37326 2.85908C8.61028 1.83992 7.13596 1.70529 6.26145 2.57483L4.69185 4.13552C4.25823 4.56668 3.96765 5.12559 4.00289 5.74561C4.09304 7.33182 4.81071 10.7447 8.81536 14.7266C13.0621 18.9492 17.0468 19.117 18.6763 18.9651C19.1917 18.9171 19.6399 18.6546 20.0011 18.2954L21.4217 16.883C22.3806 15.9295 22.1102 14.2949 20.8833 13.628L18.9728 12.5894C18.1672 12.1515 17.1858 12.2801 16.5562 12.9062Z" />
                      </svg>
                      <span>+55 (35) 3471-9200</span>
                    </a>

                    <a
                      href="https://wa.me/5535999518800"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-white hover:text-[#40d5d9] transition"
                    >
                      <svg
                        viewBox="0 1 23 22"
                        className="w-4 h-4 fill-current shrink-0"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M3.50002 12C3.50002 7.30558 7.3056 3.5 12 3.5C16.6944 3.5 20.5 7.30558 20.5 12C20.5 16.6944 16.6944 20.5 12 20.5C10.3278 20.5 8.77127 20.0182 7.45798 19.1861C7.21357 19.0313 6.91408 18.9899 6.63684 19.0726L3.75769 19.9319L4.84173 17.3953C4.96986 17.0955 4.94379 16.7521 4.77187 16.4751C3.9657 15.176 3.50002 13.6439 3.50002 12ZM12 1.5C6.20103 1.5 1.50002 6.20101 1.50002 12C1.50002 13.8381 1.97316 15.5683 2.80465 17.0727L1.08047 21.107C0.928048 21.4637 0.99561 21.8763 1.25382 22.1657C1.51203 22.4552 1.91432 22.5692 2.28599 22.4582L6.78541 21.1155C8.32245 21.9965 10.1037 22.5 12 22.5C17.799 22.5 22.5 17.799 22.5 12C22.5 6.20101 17.799 1.5 12 1.5ZM14.2925 14.1824L12.9783 15.1081C12.3628 14.7575 11.6823 14.2681 10.9997 13.5855C10.2901 12.8759 9.76402 12.1433 9.37612 11.4713L10.2113 10.7624C10.5697 10.4582 10.6678 9.94533 10.447 9.53028L9.38284 7.53028C9.23954 7.26097 8.98116 7.0718 8.68115 7.01654C8.38113 6.96129 8.07231 7.046 7.84247 7.24659L7.52696 7.52195C6.76823 8.18414 6.3195 9.2723 6.69141 10.3741C7.07698 11.5163 7.89983 13.314 9.58552 14.9997C11.3991 16.8133 13.2413 17.5275 14.3186 17.8049C15.1866 18.0283 16.008 17.7288 16.5868 17.2572L17.1783 16.7752C17.4313 16.5691 17.5678 16.2524 17.544 15.9269C17.5201 15.6014 17.3389 15.308 17.0585 15.1409L15.3802 14.1409C15.0412 13.939 14.6152 13.9552 14.2925 14.1824Z"
                        />
                      </svg>
                      <span>+55 (35) 99951-8800</span>
                    </a>

                    <a
                      href="https://inatel.br/home/contato"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-white hover:text-[#40d5d9] transition"
                    >
                      <svg
                        viewBox="0 0 21 21"
                        className="w-4 h-4 fill-none stroke-current shrink-0"
                        aria-hidden="true"
                      >
                        <path
                          d="M17.5 3.5H3.5C2.5335 3.5 1.75 4.2835 1.75 5.25V15.75C1.75 16.7165 2.5335 17.5 3.5 17.5H17.5C18.4665 17.5 19.25 16.7165 19.25 15.75V5.25C19.25 4.2835 18.4665 3.5 17.5 3.5Z"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M19.25 6.125L11.4012 11.1125C11.1311 11.2817 10.8188 11.3715 10.5 11.3715C10.1812 11.3715 9.86889 11.2817 9.59875 11.1125L1.75 6.125"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>Fale conosco</span>
                    </a>
                  </div>

                  {/* Selo / QR Code Oficial e-MEC */}
                  <a
                    href="https://emec.mec.gov.br/"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Consulte o cadastro do Inatel no Sistema e-MEC"
                    className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
                  >
                    <img
                      src={emecSeal}
                      alt="QR Code de cadastro do Inatel no e-MEC"
                      className="w-20 h-24 object-contain"
                    />
                  </a>
                </div>

                {/* Redes Sociais Oficiais */}
                <ul className="flex items-center gap-6 pt-1">
                  {REDES_SOCIAIS.map((rede) => (
                    <li key={rede.nome}>
                      <a
                        href={rede.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Ir para o ${rede.nome} do Inatel`}
                        title={`Ir para o ${rede.nome} do Inatel`}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full text-white hover:text-[#40d5d9] hover:bg-white/10 transition"
                      >
                        {rede.svg}
                      </a>
                    </li>
                  ))}
                </ul>
              </address>
            </div>

            {/* Colunas de Navegação Oficial: Educação | Canais | Acesse */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-10">
              {COLUNAS_LINKS.map((col) => (
                <div key={col.titulo}>
                  <h2 className="text-lg font-bold text-white mb-5 tracking-tight">{col.titulo}</h2>
                  <ul className="space-y-2.5 text-[15px]">
                    {col.itens.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inatel-footer-link"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Barra Inferior Oficial (#00142a — Copyright & LGPD) */}
      <section className="inatel-footer-bar py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-4 text-sm">
          <p className="text-white/60 text-center lg:text-left">
            Copyright © 2026 Inatel <span className="mx-1.5">|</span> Todos os direitos reservados.
          </p>

          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[14px]">
            {LINKS_RODAPE_LEGAL.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  target={item.href.startsWith('mailto:') ? undefined : '_blank'}
                  rel={item.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                  className="inatel-footer-legal-link"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </footer>
  );
}

