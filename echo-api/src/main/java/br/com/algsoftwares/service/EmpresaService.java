package br.com.algsoftwares.service;


import br.com.algsoftwares.entities.Empresa;
import br.com.algsoftwares.exception.EchoException;
import br.com.algsoftwares.utils.PaginatedResponse;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.Query;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.WriteResult;
import com.google.firebase.cloud.FirestoreClient;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class EmpresaService {

    @Autowired
    private Firestore firestore;

    public Empresa saveEmpresa(Empresa empresa) {
        try {
            String usuarioLogado = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            empresa.setUsuario_id(usuarioLogado);
            firestore.collection("empresas").document(empresa.getId()).set(empresa).get();
            return empresa;
        } catch (Exception e){
            throw new EchoException(e.getMessage());
        }
    }

    public Empresa findById(String id){
        try {
            String usuarioLogado = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            return firestore.collection("empresas")
                    .whereEqualTo("id", id)
                    .get()
                    .get()
                    .getDocuments()
                    .stream()
                    .findFirst()
                    .map(document -> document.toObject(Empresa.class))
                    .filter(e->e.getUsuario_id().equals(usuarioLogado))
                    .orElse(null);
        } catch (Exception e){
            throw new EchoException(e.getMessage());
        }
    }

    public boolean deleteEmpresaById(String id) {
        try {
            WriteResult result = firestore.collection("empresas").document(id).delete().get();
            return true;
        } catch (Exception e) {
            throw new RuntimeException("Erro ao deletar empresa com ID: " + id, e);
        }
    }

    public List<Empresa> findAll() {
        try {
            String usuarioLogado = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            return firestore.collection("empresas")
                    .get()
                    .get()  // Blocking call
                    .getDocuments()
                    .stream()
                    .map(document -> document.toObject(Empresa.class))
                    .filter(e->e.getUsuario_id().equals(usuarioLogado))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new EchoException("Error fetching companies: " + e.getMessage(), e);
        }
    }

    public PaginatedResponse<Empresa> findByPaginated(int page, int size, String filterValue) {
        Firestore firestore = FirestoreClient.getFirestore();

        String usuarioLogado = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Set<Empresa> empresasSet = new HashSet<>();

        try {
            if (filterValue != null && !filterValue.isEmpty()) {
                Query queryId = firestore.collection("empresas").whereEqualTo("id", filterValue);
                List<QueryDocumentSnapshot> documentsId = queryId.get().get().getDocuments();
                empresasSet.addAll(documentsId.stream().map(doc -> doc.toObject(Empresa.class)).collect(Collectors.toSet()));

                // Consulta pelo campo 'descricao'
                Query queryDescricao = firestore.collection("empresas").whereEqualTo("nomeFantasia", filterValue);
                List<QueryDocumentSnapshot> documentsDescricao = queryDescricao.get().get().getDocuments();
                empresasSet.addAll(documentsDescricao.stream().map(doc -> doc.toObject(Empresa.class)).collect(Collectors.toSet()));
            } else {
                empresasSet.addAll(firestore.collection("empresas")
                        .get()
                        .get()  // Blocking call
                        .getDocuments()
                        .stream()
                        .map(document -> document.toObject(Empresa.class))
                        .filter(e->e.getUsuario_id().equals(usuarioLogado))
                        .toList());
            }
        } catch (Exception e) {
            throw new EchoException(e.getMessage());
        }

        return  getEmpresaPaginatedResponse(page, size, empresasSet);

    }

    @NotNull
    private static PaginatedResponse<Empresa> getEmpresaPaginatedResponse(int page, int size, Set<Empresa> empresasSet) {
        List<Empresa> empresaList = new ArrayList<>(empresasSet);
        int totalElements = empresaList.size();
        int fromIndex = Math.min((page - 1) * size, totalElements);
        int toIndex = Math.min(fromIndex + size, totalElements);

        List<Empresa> paginatedList = empresaList.subList(fromIndex, toIndex);
        int totalPages = (int) Math.ceil((double) totalElements / size);

        PaginatedResponse<Empresa> response = new PaginatedResponse<>();
        response.setContent(paginatedList);
        response.setTotalElements(totalElements);
        response.setTotalPages(totalPages);
        response.setCurrentPage(page);
        return response;
    }

    public Empresa findByCnpjCpf(String cnpjCpf) {
        return new Empresa();
    }
}
