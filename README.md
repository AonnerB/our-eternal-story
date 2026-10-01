# Até a Última Página

Um conto interativo em sete cenas, feito para ser aberto no celular e terminado
olhando nos olhos de alguém.

A última tela **não faz o pedido**. Ela pede para a pessoa fechar o celular e
olhar para você. O pedido é seu.

---

## 1. Como abrir o projeto

**Jeito simples:** dê duplo clique em `index.html`. Abre no navegador e funciona.

**Jeito recomendado (VS Code):**

1. Abra a pasta `pedido-namoro` no VS Code.
2. Instale a extensão **Live Server** (autor: Ritwick Dey).
3. Clique com o botão direito em `index.html` → **Open with Live Server**.

O Live Server é melhor porque atualiza a página sozinho toda vez que você salva
uma alteração no `config.js`.

> **Nota técnica:** o projeto usa scripts clássicos em vez de módulos ES
> (`import`/`export`) exatamente para funcionar ao abrir o arquivo direto, sem
> servidor. Se você converter para módulos, o duplo clique para de funcionar.

---

## 2. Onde você mexe

Em **um arquivo só**: `config.js`.

Todo o texto que ela vai ler está lá dentro. Você não precisa abrir o HTML, o
CSS nem os outros arquivos JavaScript.

Procure por `«PREENCHER` — é assim que estão marcados todos os lugares que
esperam o seu texto. Quando não sobrar nenhum, você terminou.

Para encontrar todos de uma vez no VS Code: `Ctrl+F` (ou `Cmd+F`) e digite
`PREENCHER`.

---

## 3. Trocar o nome dela e o seu

No começo do `config.js`:

```javascript
casal: {
  ela: "Marina",
  eu: "Pedro",
  apelido: "Mari",
  dataInicio: "14 de março de 2025",
  local: "a fila do café da faculdade"
}
```

A data e o local aparecem juntos no Capítulo I, assim: *14 de março de 2025 · a
fila do café da faculdade*. Se você deixar algum em branco, ele some da tela em
vez de aparecer vazio.

---

## 4. Alterar a história

Cada capítulo tem um bloco próprio no `config.js`:

| Bloco             | O que controla                                |
|-------------------|-----------------------------------------------|
| `abertura`        | a primeira tela                               |
| `capituloUm`      | como vocês se conheceram                      |
| `capituloDois`    | o texto que acompanha as três memórias        |
| `capituloTres`    | a lista de coisas que você ama nela           |
| `capituloQuatro`  | o texto antes do envelope                     |
| `carta`           | a carta dentro do envelope                    |
| `transicao`       | as duas frases antes do pedido                |
| `pedido`          | a tela do pedido                              |
| `desfecho`        | a última tela                                 |

**Quebra de linha:** use `\n` para pular uma linha e `\n\n` para começar um
parágrafo novo.

```javascript
texto: "Primeira linha.\nSegunda linha.\n\nParágrafo novo."
```

**Cuidado com as aspas:** se o seu texto tiver aspas duplas, escreva `\"` ou use
aspas simples ao redor de tudo. Se a tela ficar preta depois de uma edição, foi
quase certamente isso. Aperte `F12` no navegador para ver o erro.

---

## 5. Adicionar fotos

1. Coloque os arquivos em `assets/images/`.
2. Os nomes que o projeto procura estão listados em
   `assets/images/LEIA-ME.txt`.

Se você quiser outro nome de arquivo, mude o caminho no `config.js`:

```javascript
foto: "assets/images/nossa-foto.jpg",
fotoAlt: "Nós dois na praia, rindo",
fotoLegenda: "Nosso primeiro dia juntos"
```

- `fotoAlt` é a descrição para quem usa leitor de tela. Escreva o que aparece na
  imagem.
- `fotoLegenda` é o texto manuscrito embaixo da foto.
- **Foto que não existe simplesmente não aparece.** A cena continua bonita. Se
  faltar alguma, o aviso fica no console do navegador (`F12`), não na tela.

As fotos entram dessaturadas e azuladas nos primeiros capítulos e vão ganhando
cor conforme a história avança. Isso é proposital — é o arco emocional do
projeto traduzido em cor.

---

## 6. Adicionar música

1. Coloque o arquivo em `assets/music/tema.mp3`.
2. Ajuste o volume inicial, se quiser:

```javascript
audio: {
  arquivo: "assets/music/tema.mp3",
  volumeInicial: 0.35   // de 0 (mudo) a 1 (máximo)
}
```

Como funciona:

- A música **nunca** começa sozinha. Ela entra no primeiro toque dela, com um
  fade de três segundos.
- O volume muda de cena em cena: sobe na carta, atinge o pico no pedido, e quase
  desaparece no desfecho.
- Se não houver arquivo, o botão `♫` nem aparece e o site funciona em silêncio.

**Use só música que você tem o direito de usar.** Uma trilha de piano
instrumental funciona muito melhor do que uma música com letra — a letra compete
com o texto que ela está lendo.

---

## 7. Alterar as memórias

```javascript
memorias: [
  {
    icone: "♡",
    titulo: "A primeira viagem",
    texto: "Você dormiu no meu ombro o caminho inteiro.",
    imagem: "assets/images/memoria1.jpg",
    alt: "Nós dois no carro"
  },
  // ...
]
```

Você pode ter **mais ou menos de três memórias** — é só adicionar ou remover
blocos da lista. O contador ("2 de 3 memórias descobertas") se ajusta sozinho, e
o botão de continuar só aparece quando todas forem abertas.

O `icone` pode ser qualquer caractere: `♡`, `🦋`, `✦`, `❦`, `☾`.

---

## 8. Alterar a carta

```javascript
carta: {
  introducao: "...",              // o texto impresso, em itálico
  corpo: "A CARTA DE VERDADE",    // manuscrita, é o coração do projeto
  assinatura: "Pedro"
}
```

Separe os parágrafos com `\n\n`. Eles aparecem em sequência, no ritmo de quem
está lendo.

O botão de continuar só aparece **8 segundos** depois da carta abrir, para ela
não passar adiante sem querer. Para mudar esse tempo, procure por `8000` em
`js/scenes.js`.

Conselho, e é o mais importante aqui: escreva como se estivesse falando com ela,
não como se estivesse escrevendo um texto bonito. O que funciona é o específico,
não o poético.

---

## 9. Alterar a mensagem final

```javascript
desfecho: {
  linhas: [
    "Então feche esta página.",
    "Olhe para mim.",
    "A próxima parte da nossa história\ncomeça fora desta tela."
  ],
  simbolo: "♥"
}
```

As linhas aparecem uma a uma, com pausa entre elas. **Essa tela não tem nenhum
botão, de propósito.** Não adicione um. O único próximo passo possível é olhar
para cima.

---

## 10. Os segredos

Durante a história passam borboletas pela tela. Se ela tocar em uma, a borboleta
pousa e aparece uma frase sua:

```javascript
segredos: [
  "Ainda penso naquele dia.",
  "Sim, eu reparei.",
  "Você é a melhor parte dos meus dias."
]
```

Depois de três segredos encontrados, uma borboleta dourada passa a acompanhar o
resto da jornada.

Existe também uma carta escondida no Capítulo III (`cartaSecreta`), que só quem
explorar encontra. Nenhum segredo é necessário para terminar a história.

---

## 11. Mudar as cores

No topo de `css/style.css`:

```css
:root {
  --noite:      #080C16;
  --luar:       #8EB5D8;
  --borboleta:  #5FA8D3;
  --brasa:      #C89B5A;
  --vinho:      #6E2436;
}
```

O dourado (`--brasa`) só entra a partir do Capítulo IV. É a recompensa visual de
ter chegado até lá. Se você espalhar o dourado pelo começo, perde o efeito.

---

## 11.1 As novidades — constelação, carta reaberta e sons

Quatro coisas foram adicionadas depois da primeira versão, todas pensadas para
parecer ainda mais com a atmosfera do filme, sem copiar nada dele.

**Constelação em coração.** A partir do Capítulo IV, um conjunto de estrelas no
canto superior esquerdo do céu se acende devagar e forma um coração, ligado por
um traço fino. É desenhado por uma fórmula matemática, não é uma imagem —
funciona em qualquer tamanho de tela. Não precisa mexer em nada para ativar.

**Reler a carta.** Depois que ela abre o envelope pela primeira vez, um pequeno
ícone `✉` aparece no canto inferior esquerdo (do lado oposto ao `♫` da música).
Ele fica disponível dali em diante, em qualquer cena, para ela reler a carta
quando quiser sem precisar voltar tudo.

**Fogos-fátuos.** Pequenas luzes azuis que sobem devagar do chão, pulsando como
se respirassem — a referência mais direta à linguagem visual do filme, que usa
esse azul-espírito o tempo todo. Aparecem discretamente a partir do Capítulo IV
e ficam mais presentes na transição e no pedido.

**Sons.** Três efeitos pequenos, gerados na hora pelo navegador — não existe
nenhum arquivo de áudio por trás, então não há nada para você baixar ou se
preocupar com direitos autorais:

- um sopro de papel ao virar cada página da história;
- um estalo seco ao quebrar o lacre do envelope;
- um sino claro quando ela toca em uma borboleta.

Esses sons seguem o mesmo interruptor da música: se ela pausar a música no
botão `♫`, os efeitos também silenciam. Sem nenhum arquivo de música carregado,
eles tocam sozinhos, baixinho, a partir do primeiro toque dela na tela.

Se quiser desativar os sons completamente, abra `js/main.js`, procure por
`window.SFX` e apague as quatro linhas que começam com `if (window.SFX)`.

---

## 11.2 Os segredos jogáveis — jogo da memória e quiz

Dois segredos a mais, escondidos de propósito. Ninguém precisa encontrá-los
para terminar a história — eles são só para quem explorar.

**O jogo da memória.** Tocar três vezes seguidas na lua, em menos de quatro
segundos, abre um joguinho de pares: oito cartas, quatro fotos, cada uma
aparece duas vezes embaralhada. Configure em `CONFIG.jogoDaMemoria`:

```javascript
jogoDaMemoria: {
  titulo: "Você se lembra?",
  fotos: [
    { src: "assets/images/jogo1.jpg", alt: "Descrição da foto" },
    { src: "assets/images/jogo2.jpg", alt: "Descrição da foto" },
    { src: "assets/images/jogo3.jpg", alt: "Descrição da foto" },
    { src: "assets/images/jogo4.jpg", alt: "Descrição da foto" }
  ]
}
```

Sem as fotos ainda? Sem problema — cada par usa um símbolo do próprio site
(♡ 🦋 ✦ ☾) no lugar, e o jogo funciona normalmente. Quando quiser trocar
pelas fotos de verdade, é só colocar os quatro arquivos em `assets/images/`
com esses nomes (ou apontar para outros nomes no `config.js`).

**O quiz.** Depois que ela abrir o envelope, uma pequena flor aparece no
canto da carta — ela já está lá, mas ninguém sabe que é clicável. Tocar nela
abre duas ou três perguntas sobre vocês dois, sem certo ou errado de
verdade, só para ela sorrir. Configure em `CONFIG.quiz`:

```javascript
quiz: {
  perguntas: [
    {
      pergunta: "Em que mês nos conhecemos?",
      opcoes: ["Março", "Junho", "Setembro"],
      correta: 1   // a posição da resposta certa, contando a partir de 0
    }
  ]
}
```

Pode ter quantas perguntas quiser — duas ou três já bastam para não cansar.

**O contador de borboletas.** Um pequeno número no canto superior esquerdo
aparece depois que ela toca na primeira borboleta, e cresce a cada nova —
ao longo de toda a jornada, não zera entre capítulos. É só um mimo visual,
não precisa configurar nada.

Todas as três descobertas — borboletas, jogo da memória e quiz — contam para
o mesmo prêmio: depois de três descobertas no total, uma borboleta dourada
passa a acompanhar o resto da história.

---

## 11.3 O cenário e as duas visitas

Quatro coisas foram refeitas ou acrescentadas depois da segunda versão.
Nenhuma delas precisa de configuração: já estão funcionando.

**A mata.** O fundo agora tem quatro planos de profundidade: a claridade
da lua presa na névoa do horizonte, uma mata distante (menor e mais
clara, porque o ar entre ela e você rouba contraste), uma mata próxima
(mais alta e mais escura) e duas árvores nos cantos, que emolduram a
cena. Cada plano balança num ritmo diferente — o vento chega primeiro na
copa. A mata é um desenho que se repete na horizontal, então ela cobre
qualquer largura de tela sem esticar nem cortar nenhuma copa.

**A noiva.** De vez em quando uma silhueta de vestido longo e véu
atravessa o fundo, devagar, e some na névoa do outro lado. Ela tem véu
de tule que ondula, cauda de vestido arrastando, coroa de flores e um
buquê que ainda guarda um pouco de luz. A lua bate só na borda dela —
é esse fio claro que faz a figura ser lida como uma pessoa e não como
uma mancha escura. A barra do vestido se desfaz na bruma, em vez de
ficar recortada em cima do chão.

É uma figura original: sem rosto, sem nenhuma feição, sem nada que
lembre um personagem específico de filme nenhum. Ela aparece na
abertura e nos capítulos I a IV, no máximo uma vez por cena, e nem
sempre — é para ela ser um acontecimento, não um enfeite fixo.

**A aranha.** Desce num fio de seda por uma das laterais da tela, fica
balançando um instante e sobe de volta. Tem oito pernas que se ajeitam
sozinhas, uma gota de orvalho que escorrega pelo fio e dois olhinhos
azuis que piscam.

**Ela é tocável.** Se sua namorada encostar na aranha, a aranha se
assusta, solta uns fiapos de seda e sobe correndo — e isso conta como
uma descoberta, exatamente igual às borboletas. As frases desse momento
ficam em `CONFIG.aranha.frases`:

```javascript
aranha: {
  frases: [
    "Ela também estava esperando por você.",
    "Até as aranhas daqui torcem por nós."
  ]
}
```

Se você apagar as frases ou deixar os `«PREENCHER`, o projeto usa as
frases padrão dele e nada quebra.

Existe ainda uma segunda aranha, parada, morando na teia do canto
superior esquerdo. Essa não se mexe do lugar: só ajeita as pernas de
vez em quando, como quem espera.

**O clique final.** Quando ela responde, as borboletas não se amontoam
mais no centro da tela: elas se organizam sobre uma curva de coração e
ficam lá, respirando, até serem soltas.

---

## 12. Publicar

Você precisa de um link para mandar para ela. Qualquer uma das três opções
abaixo é gratuita.

### Netlify (o mais rápido — não precisa de conta)

1. Acesse `app.netlify.com/drop`.
2. Arraste a pasta `pedido-namoro` inteira para a página.
3. Pronto. O link aparece na hora.

### Vercel

1. Crie uma conta em `vercel.com`.
2. Instale: `npm i -g vercel`.
3. Dentro da pasta, rode `vercel` e siga as perguntas.

### GitHub Pages

1. Crie um repositório novo no GitHub.
2. Suba os arquivos (arrastar e soltar pela interface do site funciona).
3. Vá em **Settings → Pages**.
4. Em *Source*, escolha a branch `main` e a pasta `/ (root)`.
5. Em um ou dois minutos o link fica no ar.

**Um detalhe que importa:** escolha um nome de link discreto. `nossa-historia`
funciona. `pedido-de-namoro-marina` entrega tudo antes dela abrir.

O preview do link no WhatsApp mostra apenas o título e a descrição, que você
controla em `CONFIG.meta`. Mantenha vago.

---

## 13. Antes de mandar o link

- [ ] Nenhum `«PREENCHER` sobrou (`Ctrl+F` no `config.js`).
- [ ] Abri no meu celular e passei por todas as sete cenas.
- [ ] Li a carta em voz alta. Ela soa como eu falando?
- [ ] As fotos carregaram (abri o console com `F12` para conferir).
- [ ] Testei com o som ligado e com o som desligado.
- [ ] O nome do link não entrega a surpresa.
- [ ] O celular dela vai estar com bateria.
- [ ] **Eu vou estar do lado dela quando ela abrir.**

Esse último item é o projeto inteiro. O site termina pedindo para ela olhar para
você. Se você não estiver lá, ele não termina.

---

## 14. Estrutura dos arquivos

```
pedido-namoro/
├── index.html          Estrutura da página e camadas do cenário
├── config.js           ← É AQUI QUE VOCÊ MEXE
├── css/
│   ├── style.css       Paleta, tipografia, céu, componentes
│   ├── animations.css  Todas as animações
│   └── responsive.css  Ajustes por tamanho de tela
├── js/
│   ├── utils.js        Funções auxiliares
│   ├── sfx.js          Sons sintetizados (papel, lacre, sino)
│   ├── audio.js        Controle da música
│   ├── particles.js    Poeira, borboletas, pétalas, fogos-fátuos,
│   │                   a silhueta da noiva e a aranha
│   ├── scenes.js       Montagem de cada capítulo
│   └── main.js         Ordem das cenas, transições e constelação
└── assets/
    ├── images/         Suas fotos
    ├── music/          Sua música
    └── fonts/          Fontes locais (opcional)
```

---

## 15. Se alguma coisa quebrar

| Sintoma | Causa provável |
|---|---|
| Tela preta, nada acontece | Erro de sintaxe no `config.js` — aspas ou vírgula. Aperte `F12` e veja o erro em vermelho. |
| Foto não aparece | Nome do arquivo diferente do que está no `config.js`, ou extensão trocada (`.jpeg` em vez de `.jpg`). |
| Música não toca | O arquivo não está em `assets/music/` ou o nome não bate. O navegador também exige um toque antes de tocar qualquer som. |
| Títulos com fonte errada | Sem internet, as fontes do Google não carregam. Veja `assets/fonts/LEIA-ME.txt`. |
| Animações sumiram | O aparelho está com "reduzir movimento" ligado. É proposital — a história continua inteira. |
| A noiva ou a aranha não apareceram | As duas são sorteadas a cada cena, e nem sempre saem. Vire a página e volte, ou recarregue. Com "reduzir movimento" ligado elas não aparecem nunca. |

---

Feito para ser usado uma vez só, e para a pessoa certa. Boa sorte.
