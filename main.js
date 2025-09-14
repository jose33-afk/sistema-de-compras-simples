import { readFile, writeFile } from "node:fs/promises";
import readline from "node:readline/promises"; //Esse funciona com await.
import { stdin as input, stdout as output } from "node:process";
import { select } from "@inquirer/prompts";
import chalk from "chalk";

function principal() {
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
        theme: {
          helpMode: "never" //tira a dica
        }
      });

      if (answer === "5") {
        console.log("Usuário cancelou");
        return;
      } else if (answer === "1") {
        delay(verProdutos, 500);
        interfaceMercado();
        console.clear();
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

    /*while (true) {
      menu();
      let opcSelec = await rl.question(": ");

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
    }*/
  }

  function verProdutos() {
    console.log(`\n${"=".repeat(28)}`);
    dados.produtos.forEach((produto) => {
      console.log(
        chalk.cyan(
          `[${produto.id}] - ${produto.produto}, preco:${produto.preco}, estoque:${produto.quantidade}`
        )
      );
    });
    console.log(`${"=".repeat(28)}`);
  }

  async function addProduto() {
    const rl = readline.createInterface(input, output);
    let quantidadeProduts = dados.produtos.length;
    let opc = 0;
    console.log(`${"=".repeat(28)}\n`);
    console.log(`Selecione o numero do produto de 1 a ${quantidadeProduts}:\n`);

    while (true) {
      opc = await rl.question("Numero do produto:");
      if (opc >= 1 && opc <= quantidadeProduts) {
        let estoqueStatus = "Adicionando ao Carrinho..";
        let produtoAchado = dados.produtos.find(
          (produto) => produto.id === opc
        );
        let carrinhoEncontrado = carrinho.find(
          (item) => item.nome === produtoAchado.produto
        ); //6
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
          } else estoqueStatus = "Acabou o Estoque de";
        } else {//Primeira vez.
          if (quantidadeOriginal > 0) {
            removeQuantidade();
            carrinho.push({id: produtoAchado.id, nome: produtoAchado.produto, preco: produtoAchado.preco, quantidade: 1,});
          } else estoqueStatus = "Acabou o Estoque de";
        }

        console.log(chalk.yellow(`${estoqueStatus} ${produtoAchado.produto}`));
        rl.close()
        delay(interfaceMercado, 1000);
        break;
      } else {
        console.log(
          chalk.red("Selecione um produto EXISTENTE!\nLista de produtos")
        );
        verProdutos();
      }
    }
  }

  const removerQuantidade = (idProduto) => {
    console.log(idProduto);
  };

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
    delay(interfaceMercado, 1000);
    
    /*menuMercado();
    console.log(chalk.green("[1] Voltar pro menu"));
    console.log(chalk.red("[2] Remover um produto?"));
    let opc = await rl.question("Opcao:");

    if (opc === "1") {
      delay(interfaceMercado, 1000);
    } else {
      console.log(`${"=".repeat(28)}\n`);
      menuMercado();

      let par = 0;
      while (true) {
        let existe = 0;
        opc = await rl.question("Qual produto deseja remover:");
        for (let item of carrinho) {
          if (item.id === opc) {
            existe = 1;
            break;
          }
        }
        if (existe) break;
        console.log(chalk.red("[ERRO] opcao n existe!"));
        if ((par / 2) % 0) menuMercado();
        par++;
        console.log(par);
      }
      removerQuantidade(opc);
    }
      */
  }
}

function delay(fun, ms) {
  console.log(chalk.green("carregando..."));
  setTimeout(fun, ms);
}

console.log(chalk.magenta("Mercado"));
principal();
