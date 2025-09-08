import { readFile } from "node:fs/promises";
import readline from "node:readline/promises"; //Esse funciona com await.
import { stdin as input, stdout as output } from "node:process";

const menu = () => {
  output.write(`${"=".repeat(28)}\n`);
  output.write(
    " 1 - Ver Produtos\n 2 - Adicionar ao carrinho\n 3 - Ver carrinho\n 4 - Finalizar compra\n 5 - Sair\n"
  );
  output.write(`${"=".repeat(28)}\n`);
};

async function principal() {
  const rl = readline.createInterface(input, output); //2
  const conteudo = await readFile("./produtos.json", "utf-8"); //1
  const dados = JSON.parse(conteudo);
  const carrinho = [];

  interfaceMercado();

  async function interfaceMercado() {
    while (true) {
      menu();
      let opcSelec = await rl.question("Opção: ");

      if (opcSelec === "5") {
        rl.close();
        break;
      } else if (opcSelec === "1") verProdutos();
      else if (opcSelec === "2") {
        addProduto();
        break;
      }
    }
  }

  function verProdutos() {
    output.write(`${"=".repeat(28)}\n`);
    dados.produtos.forEach((produto) => {
      output.write(
        `[${produto.id}] - ${produto.produto}, preco:${produto.preco}, estoque:${produto.quantidade}\n`
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
      if (opc >= 1 && opc <= 3) {
        let produtoAchado = dados.produtos.find(produto => produto.id === opc);
        carrinho.push({nome: produtoAchado.produto, preco: produtoAchado.preco})
        console.log(produtoAchado.preco)
        console.log(`Carrinho ${carrinho[0].nome} preco:${carrinho[0].preco}`)
        //chamar reset, falta modificar a quantidade do estoque olha chat gpt, e falta criar a interface pra carrinho.
        break;
      } else {
        console.log("Selecione um produto EXISTENTE!\nLista de produtos");
        verProdutos();
      }
      console.log(`Opcao Digitada:${opc}`);
    }
  }

  function reseta() {
    rl.close();
    interfaceMercado();
  }
}

//Inicio
//output.write("Mercado\n");
principal();

/*
 1 - readfile so entende txt, por isso converte primeiro, pra depois transformar um arquivo txt em forma de json em obj.
 2 - Tem que ficar aqui, se ele ficar fora ele fica funcionando e n finaliza o programa msm n chamando a funcao principal.
*/
