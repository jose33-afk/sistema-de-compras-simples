import { readFile, writeFile } from "node:fs/promises";
import readline from "node:readline/promises"; //Esse funciona com await.
import { stdin as input, stdout as output } from "node:process";
import { select } from "@inquirer/prompts";
import chalk from "chalk";

function principal() {
  const carrinho = [];
  let conteudo;
  let dados;
  let interfacemain = false;

  async function regarregarFile() {
    conteudo = await readFile("./produtos.json", "utf-8"); //1
    dados = JSON.parse(conteudo);
  }

  regarregarFile();
  interfaceMercado();

  async function interfaceMercado() {
    try {
      console.log(chalk.gray("Use as setas para navegar e Enter para confirmar"));
      console.log(`${"=".repeat(28)}`);
      const answer = await select({
        message: "Selecione uma opcao:",
        choices: [
          { name: "Ver produtos", value: "1" },
          { name: "Adicionar ao carrinho", value: "2" },
          { name: "Ver Carrinho", value:"3"},
          { name: "Finalizar compra", value:"4"},
          { name: "Cancelar", value:"5" },
        ],
        theme: { helpMode: "never" } //remove a dica.
      });

      if (answer === "5") {
        console.log("Usuário cancelou");
        return;
      } else if (answer === "1") {
        interfacemain = true;
        delay(verProdutos, 500)
        interfaceMercado();
      } else if (answer === "2") delay(addProduto, 500);
         else if (answer === "3") {
           if (carrinho.length > 0) mostrarCarrinho();
           else {
            console.log(chalk.red("Você ainda n adicionou Produtos ao Carrinho!"));
            interfaceMercado();
           } 
         } 
    } catch (error) {
      if (error.name === "ExitPromptError") {
        console.log(chalk.red("Operacao cancelada!"));
        return;
      }
      throw error; //pra mostar os outros erros.
    }
  }

  function verProdutos() {
    console.clear()
    if (interfacemain) console.log("clique nas setas para voltar ao menu");
    console.log(`\n${"=".repeat(28)}`);
    dados.produtos.forEach((produto) => {
      console.log(
        chalk.cyan(
          `[${produto.id}] - ${produto.produto}, preco:${produto.preco}, estoque:${produto.quantidade}`
        )
      );
    });
    console.log(`${"=".repeat(28)}`);
    interfacemain = false;
  }

  async function addProduto() {
    console.clear()
    const rl = readline.createInterface(input, output);
    let quantidadeProduts = dados.produtos.length;
    let opc = 0;
    console.log(`${"=".repeat(28)}`);
    console.log(`Selecione o numero do produto de 1 a ${quantidadeProduts} (aperte 0 pra lista de produtos):`);

    while (true) {
      opc = await rl.question("Numero do produto:");
      if (opc >= 1 && opc <= quantidadeProduts) {
        let estoqueStatus = "Adicionando ao Carrinho..";
        let stoqueOK = false;
        let produtoAchado = dados.produtos.find((produto) => produto.id === opc);
        let carrinhoEncontrado = carrinho.find((item) => item.nome === produtoAchado.produto); //6
        let quantidadeOriginal = Number(produtoAchado.quantidade);

        async function removeQuantidade() {
          quantidadeOriginal--;
          produtoAchado.quantidade = quantidadeOriginal.toString();
          await writeFile("./produtos.json", JSON.stringify(dados, null, 2)); //5
          regarregarFile();
        }

        if (carrinhoEncontrado) {//4
          if (quantidadeOriginal > 0) {//Adicionar 1+
            removeQuantidade();
            carrinhoEncontrado.quantidade += 1;
            stoqueOK = true;
          } else estoqueStatus = "Acabou o Estoque de";
        } else {//Primeira vez.
          if (quantidadeOriginal > 0) {
            removeQuantidade();
            carrinho.push({id: produtoAchado.id, nome: produtoAchado.produto, preco: produtoAchado.preco, quantidade: 1,});
            stoqueOK = true;
          } else {
            estoqueStatus = "Acabou o Estoque de"
          
          };
        }
 
        verProdutos(); //Primeira vez.
        console.log(chalk.yellow(`${estoqueStatus} ${produtoAchado.produto}`));

        if (stoqueOK) {
          rl.close()
          delay(interfaceMercado, 1000);
          break;
        }
        
      } else {
        verProdutos();
        if (opc != 0) console.log(chalk.red("Selecione um produto EXISTENTE!"));
      }
    }
  }

  async function mostrarCarrinho() {
    console.log(`${"=".repeat(28)}\n`);
    console.log(chalk.yellow("Carrinho:"));

    const menuMercado = () => {
      for (let item of carrinho) {
        console.log(
          chalk.yellow(
            `[${item.id}]Produto:${item.nome},Valor ${item.preco}, Quantidade:${item.quantidade}`
          )
        );
      }
    };
    menuMercado()

    const opc = await select({
      message:"Selecione uma opcao:",
      choices:[
        { name:chalk.green("[1] Voltar pro menu"), value:"1"},
        { name:chalk.red("[2] Remover um produto?"), value:"2"}
      ],
      theme: { helpMode: "never"}
    })

    async function criarMenuRemover() {
      let opcaoes = [];
      for (let item of carrinho) {
        opcaoes.push({ name:chalk.yellow(`Produto:${item.nome}, Valor:${item.preco}, Quantidade:${item.quantidade}`), value:item.id})
      }
       return await select({
        message:"Selecione o produto",
        choices:opcaoes,
        theme: { helpMode: "never" }
       });
    }

    if (opc === "1") delay(interfaceMercado, 500);
    else {
      console.log(`${"=".repeat(28)}\n`);
      devolverProduto(await criarMenuRemover());
    }

    async function devolverProduto(idProduto) {
      const index = carrinho.findIndex(produto => produto.id === idProduto);

      if (carrinho[index].quantidade > 0) carrinho[index].quantidade--;
      if (carrinho[index].quantidade === 0) carrinho.splice(index, 1);
      
      //Arquivo.
      let produtoAchado = dados.produtos.find((produto) => produto.id === idProduto);
      let quantidadeOriginal = Number(produtoAchado.quantidade);
      quantidadeOriginal++;
      produtoAchado.quantidade = quantidadeOriginal.toString();
      await writeFile("./produtos.json", JSON.stringify(dados, null, 2)); //5
      regarregarFile();

      delay(interfaceMercado, 500);
    }
  }
}

function delay(fun, ms) {
  console.log(chalk.green("carregando..."));
  setTimeout(fun, ms);
}

console.log(chalk.magenta("Mercado"));
principal();
