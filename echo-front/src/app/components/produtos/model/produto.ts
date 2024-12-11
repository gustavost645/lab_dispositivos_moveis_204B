import { Empresa } from "../../empresas/model/empresa";

export interface Produto {

    id?:string;
    nomeProduto?:string;
    descricao?:string;
    marca?:string;
    codBarras?:string;
    preco?:number;
    empresa?:Empresa;

}
