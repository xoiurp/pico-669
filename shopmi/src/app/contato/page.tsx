import React from "react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const dynamic = "force-static";

export const metadata = {
  title: "Contato - PICO",
  description:
    "Entre em contato com a equipe PICO. Estamos prontos para atender você.",
};

const contatoCategories = [
  {
    title: "Atendimento ao cliente",
    items: [
      {
        question: "Quais são os canais de atendimento?",
        answer:
          "Você pode entrar em contato conosco por e-mail em 996.pico@gmail.com, pelo chat ao vivo disponível no canto inferior direito do site durante o horário comercial, por telefone no (19) 99413-3851, ou através das nossas redes sociais no Instagram (@pico.oficial) e Facebook. Escolha o canal que for mais conveniente para você.",
      },
      {
        question: "Qual o horário de atendimento?",
        answer:
          "Nosso atendimento funciona de segunda a sexta-feira, das 9h às 18h (horário de Brasília). Aos sábados, atendemos das 9h às 13h. Domingos e feriados nacionais não há atendimento. Mensagens recebidas fora do horário comercial serão respondidas no próximo dia útil.",
      },
      {
        question: "Qual o prazo de resposta?",
        answer:
          "Nosso compromisso é responder todas as solicitações em até 24 horas úteis. Para questões urgentes relacionadas a pedidos em andamento, recomendamos utilizar o chat ao vivo ou o telefone para um atendimento mais rápido. E-mails e mensagens nas redes sociais são respondidos por ordem de chegada.",
      },
    ],
  },
  {
    title: "Pedidos e entregas",
    items: [
      {
        question: "Como acompanho o status do meu pedido?",
        answer:
          "Você pode acompanhar seu pedido acessando \"Meus Pedidos\" na sua conta. Assim que o pedido for despachado, enviaremos o código de rastreamento por e-mail. Se precisar de informações adicionais sobre sua entrega, envie o número do pedido para nosso atendimento que verificaremos o status atualizado junto à transportadora.",
      },
      {
        question: "Meu pedido atrasou, o que faço?",
        answer:
          "Se o prazo de entrega estimado já passou, primeiro verifique o rastreamento pelo código enviado por e-mail. Caso o rastreamento não apresente atualização há mais de 5 dias úteis, entre em contato conosco informando o número do pedido. Nossa equipe investigará junto à transportadora e providenciará uma solução, que pode incluir reenvio ou reembolso.",
      },
      {
        question: "Recebi o produto errado ou com defeito, como proceder?",
        answer:
          "Lamentamos o ocorrido. Entre em contato conosco em até 7 dias após o recebimento, enviando fotos do produto recebido, o número do pedido e uma descrição do problema. Providenciaremos a coleta do item e o envio do produto correto ou a devolução do valor, conforme sua preferência. Todos os custos de envio serão por nossa conta.",
      },
    ],
  },
  {
    title: "Trocas e devoluções",
    items: [
      {
        question: "Como solicitar uma troca ou devolução?",
        answer:
          "Para solicitar uma troca ou devolução, acesse sua conta na seção \"Meus Pedidos\" e clique em \"Solicitar troca/devolução\" no pedido desejado. Você também pode entrar em contato diretamente com nosso atendimento informando o número do pedido e o motivo. O produto deve estar em sua embalagem original, sem sinais de uso e com todas as etiquetas.",
      },
      {
        question: "Qual o prazo para solicitar uma troca?",
        answer:
          "Você tem até 30 dias corridos após o recebimento para solicitar a troca de produtos. Para produtos com defeito de fabricação, o prazo é de 90 dias conforme o Código de Defesa do Consumidor. Após a aprovação da solicitação, enviaremos as instruções de envio e uma etiqueta de postagem pré-paga.",
      },
      {
        question: "Quando recebo o reembolso?",
        answer:
          "O reembolso é processado em até 10 dias úteis após recebermos e inspecionarmos o produto devolvido. Para compras no cartão de crédito, o estorno aparecerá na fatura seguinte. Para PIX e boleto, o valor é transferido para a conta bancária informada por você. Você receberá uma confirmação por e-mail assim que o reembolso for efetuado.",
      },
    ],
  },
  {
    title: "Informações da empresa",
    items: [
      {
        question: "Onde fica a sede da PICO?",
        answer:
          "Nossa sede está localizada na Rua Major Solon, 996, Cambuí, Campinas - SP. Nosso showroom funciona de segunda a sábado, das 10h às 19h, e você é muito bem-vindo para conhecer nossos produtos pessoalmente. Não é necessário agendamento.",
      },
      {
        question: "A PICO possui lojas físicas?",
        answer:
          "Além da nossa loja principal em Campinas, estamos presentes em pontos de venda selecionados em diversas cidades brasileiras. Para conhecer o ponto de venda mais próximo de você, entre em contato com nosso atendimento ou consulte a seção \"Nossas Lojas\" no rodapé do site.",
      },
      {
        question: "Como posso trabalhar na PICO?",
        answer:
          "Estamos sempre em busca de talentos que compartilhem nossa paixão por moda e inovação. Envie seu currículo para vagas@pico.com.br com o cargo de interesse no assunto do e-mail. Acompanhe também nossas vagas abertas no LinkedIn. Valorizamos diversidade, criatividade e comprometimento em nossa equipe.",
      },
      {
        question: "A PICO aceita parcerias e colaborações?",
        answer:
          "Sim, estamos abertos a parcerias com criadores de conteúdo, marcas complementares e iniciativas que estejam alinhadas aos nossos valores. Para propostas comerciais, envie um e-mail para parcerias@pico.com.br com detalhes da proposta. Nossa equipe analisará e retornará em até 5 dias úteis.",
      },
    ],
  },
];

export default function ContatoPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative w-full bg-[#f5f5f5] pt-[120px] md:pt-[140px] pb-12 md:pb-16">
        <div className="text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <ol className="flex items-center justify-center gap-2 text-[11px] sm:text-xs tracking-[0.15em] text-[#666]">
              <li>
                <Link
                  href="/"
                  className="hover:text-[#1a1a1a] transition-colors uppercase"
                >
                  Home
                </Link>
              </li>
              <li className="text-[#ccc]">/</li>
              <li className="text-[#1a1a1a] font-medium uppercase">
                Contato
              </li>
            </ol>
          </nav>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-[#1a1a1a] tracking-wide mb-6">
            Contato
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-[#666] max-w-2xl mx-auto leading-relaxed font-light">
            Tem alguma dúvida, sugestão ou precisa de ajuda? Nossa equipe está
            pronta para atender você da melhor forma possível.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16 sm:mb-20">
          {/* Email */}
          <div className="text-center p-6 border border-[#e0e0e0] rounded-sm">
            <div className="w-10 h-10 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xs uppercase tracking-[0.15em] font-medium text-[#1a1a1a] mb-2">
              E-mail
            </h3>
            <p className="text-sm text-[#666]">996.pico@gmail.com</p>
          </div>

          {/* Phone */}
          <div className="text-center p-6 border border-[#e0e0e0] rounded-sm">
            <div className="w-10 h-10 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="text-xs uppercase tracking-[0.15em] font-medium text-[#1a1a1a] mb-2">
              Telefone
            </h3>
            <p className="text-sm text-[#666]">(19) 99413-3851</p>
          </div>

          {/* Address */}
          <div className="text-center p-6 border border-[#e0e0e0] rounded-sm">
            <div className="w-10 h-10 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xs uppercase tracking-[0.15em] font-medium text-[#1a1a1a] mb-2">
              Endereço
            </h3>
            <p className="text-sm text-[#666]">Rua Major Solon, 996<br />Cambuí, Campinas - SP</p>
          </div>
        </div>

        {/* FAQ-style Accordion Sections */}
        <div className="space-y-12 sm:space-y-16">
          {contatoCategories.map((category) => (
            <section key={category.title}>
              {/* Category Title */}
              <h2 className="text-2xl sm:text-3xl font-light text-[#1a1a1a] mb-6 sm:mb-8">
                {category.title}
              </h2>

              {/* Accordion */}
              <Accordion type="single" collapsible className="w-full">
                {category.items.map((item, index) => (
                  <AccordionItem
                    key={index}
                    value={`${category.title}-${index}`}
                    className="border-b border-[#e0e0e0] last:border-b-0"
                  >
                    <AccordionTrigger className="text-sm sm:text-base font-medium text-[#1a1a1a] hover:no-underline py-5 sm:py-6 text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-[#666] leading-relaxed">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 sm:mt-20 pt-12 border-t border-[#e0e0e0] text-center">
          <h3 className="text-xl sm:text-2xl font-light text-[#1a1a1a] mb-3">
            Prefere falar diretamente conosco?
          </h3>
          <p className="text-sm text-[#666] mb-8 max-w-md mx-auto">
            Envie uma mensagem por e-mail e nossa equipe responderá o mais
            rápido possível.
          </p>
          <a
            href="mailto:996.pico@gmail.com"
            className="inline-block bg-[#1a1a1a] text-white py-3.5 px-10 text-xs tracking-[0.15em] uppercase font-medium hover:bg-black transition-colors"
          >
            Enviar e-mail
          </a>
        </div>
      </div>
    </div>
  );
}
