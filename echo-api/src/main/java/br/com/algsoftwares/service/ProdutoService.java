package br.com.algsoftwares.service;

import br.com.algsoftwares.entities.Empresa;
import br.com.algsoftwares.entities.Produto;
import br.com.algsoftwares.exception.EchoException;
import br.com.algsoftwares.utils.PaginatedResponse;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
public class ProdutoService {

    @Autowired
    private Firestore firestore;

    public Produto saveProduto(Produto produto)  {
        try {
            firestore.collection("empresas")
                    .document(produto.getEmpresa().getId())
                    .collection("produtos")
                    .document(produto.getId())
                    .set(produto)
                    .get();
            return produto;
        } catch (Exception e){
            throw new EchoException(e.getMessage());
        }
    }

    public PaginatedResponse<Produto> findByPaginated(int page, int size, String filterValue, String empresa) {
        Firestore firestore = FirestoreClient.getFirestore();

        Set<Produto> pedidosSet = new HashSet<>(); // Usar um Set para evitar duplicatas

        try {
            if (filterValue != null && !filterValue.isEmpty()) {
                Query queryId = firestore.collection("empresas").document(empresa).collection("produtos").whereEqualTo("id", filterValue);
                List<QueryDocumentSnapshot> documentsId = queryId.get().get().getDocuments();
                pedidosSet.addAll(documentsId.stream().map(doc -> doc.toObject(Produto.class)).collect(Collectors.toSet()));

                Query queryDescricao = firestore.collection("empresas").document(empresa).collection("produtos").whereEqualTo("descricao", filterValue);
                List<QueryDocumentSnapshot> documentsDescricao = queryDescricao.get().get().getDocuments();
                pedidosSet.addAll(documentsDescricao.stream().map(doc -> doc.toObject(Produto.class)).collect(Collectors.toSet()));

                Query queryCodBarras = firestore.collection("empresas").document(empresa).collection("produtos").whereEqualTo("codBarras", filterValue);
                List<QueryDocumentSnapshot> documentsCodBarras = queryCodBarras.get().get().getDocuments();
                pedidosSet.addAll(documentsCodBarras.stream().map(doc -> doc.toObject(Produto.class)).collect(Collectors.toSet()));
            } else {
                CollectionReference produtosRef = firestore.collection("empresas").document(empresa).collection("produtos");

                List<QueryDocumentSnapshot> produtosDocs = produtosRef.get().get().getDocuments();
                pedidosSet.addAll(produtosDocs.stream()
                        .map(doc -> doc.toObject(Produto.class))
                        .toList());
            }
        } catch (InterruptedException | ExecutionException e) {
            throw new EchoException(e.getMessage());
        }

        return getPaginatedResponse(page, size, pedidosSet);

    }

    @NotNull
    private static PaginatedResponse<Produto> getPaginatedResponse(int page, int size, Set<Produto> pedidosSet) {
        List<Produto> produtoList = new ArrayList<>(pedidosSet);
        int totalElements = produtoList.size();
        int fromIndex = Math.min((page - 1) * size, totalElements);
        int toIndex = Math.min(fromIndex + size, totalElements);

        List<Produto> paginatedList = produtoList.subList(fromIndex, toIndex);
        int totalPages = (int) Math.ceil((double) totalElements / size);

        PaginatedResponse<Produto> response = new PaginatedResponse<>();
        response.setContent(paginatedList);
        response.setTotalElements(totalElements);
        response.setTotalPages(totalPages);
        response.setCurrentPage(page);
        return response;
    }

    public boolean deleteProdutoById(String idEmpresa, String idProduto) {
        try {
            // Referência para a coleção de produtos na empresa
            CollectionReference produtosRef = firestore.collection("empresas").document(idEmpresa).collection("produtos");

            // Remover o produto da sub-coleção de produtos da empresa
            WriteResult result = produtosRef.document(idProduto).delete().get();

            // Verificar se o produto foi removido com sucesso
            if (result != null) {
                return true;
            } else {
                throw new RuntimeException("Produto não encontrado na empresa com ID: " + idProduto);
            }
        } catch (Exception e) {
            // Tratar erro e lançar exceção personalizada
            throw new RuntimeException("Erro ao deletar produto da empresa com ID: " + idProduto, e);
        }
    }
}
