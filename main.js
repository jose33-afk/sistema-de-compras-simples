import { readFile, writeFile } from "node:fs/promises";
import readline from "node:readline/promises"; //Esse funciona com await.
import { stdin as input, stdout as output } from "node:process";
import chalk from "chalk";

const menu = () => {
  output.write(`${"=".repeat(28)}\n`);
  output.write(
    " 1 - Ver Produtos\n 2 - Adicionar ao carrinho\n 3 - Ver carrinho\n 4 - Finalizar compra\n 5 - Sair\n"
  );
  output.write(`${"=".repeat(28)}\n`);
};

function principal() {
  const rl = readline.createInterface(input, output); //2
  const carrinho = [];
  let conteudo;
  let dados;

  async function regarregarFile() {
    conteudo = await readFile("./produtos.json", "utf-8"); //1
    dados = JSON.parse(conteudo);
  }
  
  regarregarFile();
  interfaceMercado();

  async function interfaceMercado() {
    while (true) {
      menu();
      let opcSelec = await rl.question("Opção: ");

      if (opcSelec === "5") {
        rl.close();
        break;
      } else if (opcSelec === "1") {
        verProdutos();
      } else if (opcSelec === "2") {
        addProduto();
        break;
      } else if (opcSelec === "3") {
        if (carrinho.length > 0) {
          mostrarCarrinho();
          break;
        } else {
          console.log(chalk.red("Você ainda n adicionou Produtos ao Carrinho!"));
        }
      }
    }
  }

  function verProdutos() {
    output.write(`${"=".repeat(28)}\n`);
    dados.produtos.forEach((produto) => {
      output.write(
        chalk.cyan(
          `[${produto.id}] - ${produto.produto}, preco:${produto.preco}, estoque:${produto.quantidade}\n`
        )
      );
    });
  }

  async function addProduto() {
    let quantidadeProduts = dados.produtos.length;
    let opc = 0;
    output.write(`${"=".repeat(28)}\n`);
    output.write(
      `Selecione o numero do produto de 1 a ${quantidadeProduts}:\n`
    );

    while (true) {
      opc = await rl.question("Numero do produto:");
      if (opc >= 1 && opc <= quantidadeProduts) {
        let estoqueStatus = "Adicionando ao Carrinho..";
        let produtoAchado = dados.produtos.find((produto) => produto.id === opc);
        let carrinhoEncontrado = carrinho.find((item) => item.nome === produtoAchado.produto); //6
        let quantidadeOriginal = Number(produtoAchado.quantidade);

        async function removeQuantidade() {
          quantidadeOriginal --;
          produtoAchado.quantidade =  quantidadeOriginal.toString();
          await writeFile("./produtos.json", JSON.stringify(dados, null, 2))//5
          regarregarFile();
        }

        if (carrinhoEncontrado) {//4
          if (quantidadeOriginal > 0) { //Adicionar 1+
            removeQuantidade();
            carrinhoEncontrado.quantidade += 1
          } else estoqueStatus = "Acabou o Estoque de";

        } else { //Primeira vez.
          if (quantidadeOriginal > 0) {
            removeQuantidade();
            carrinho.push({nome: produtoAchado.produto, preco: produtoAchado.preco, quantidade: 1});
          } else estoqueStatus = "Acabou o Estoque de";
        } 

        console.log(chalk.yellow(`${estoqueStatus} ${produtoAchado.produto}`));
        delay(interfaceMercado, 1000);
        break;

      } else {
        console.log(chalk.red("Selecione um produto EXISTENTE!\nLista de produtos"));
        verProdutos();
      }
    }
  }

  function mostrarCarrinho() {
    output.write(`${"=".repeat(28)}\n`);
    console.log(chalk.yellow("Carrinho:"));
    for (let item of carrinho) {
      console.log(
        chalk.yellow(
          `Produto:${item.nome},Valor ${item.preco}, Quantidade:${item.quantidade}`
        )
      );
    }
    delay(interfaceMercado, 1000);
  }
}

function delay(fun, ms) {
  output.write(chalk.green("carregando...\n"));
  setTimeout(fun, ms);
}

//Inicio.
output.write(chalk.magenta("Mercado\n"));
principal();
