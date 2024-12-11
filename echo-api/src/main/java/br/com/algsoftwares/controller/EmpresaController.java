package br.com.algsoftwares.controller;

import br.com.algsoftwares.entities.Empresa;
import br.com.algsoftwares.service.EmpresaService;
import br.com.algsoftwares.utils.ErrorResponse;
import br.com.algsoftwares.utils.PaginatedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/empresas")
public class EmpresaController {

    private static final Logger logger = LoggerFactory.getLogger(EmpresaController.class);

    @Autowired
    private EmpresaService empresaService;

    @PostMapping
    @Operation(summary = "Cria uma nova empresa", responses = {
            @ApiResponse(responseCode = "201", description = "Empresa criada com sucesso", content = @Content(schema = @Schema(implementation = Empresa.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<?> criarEmpresa(@RequestBody Empresa empresa)  {
        try {
            Empresa novaEmpresa = empresaService.saveEmpresa(empresa);
            return ResponseEntity.status(HttpStatus.CREATED).body(novaEmpresa);
        } catch (Exception e) {
            logger.error("Erro ao criar empresa com CNPJ/CPF: {}", empresa.getCnpjCpf(), e);
            ErrorResponse errorResponse = new ErrorResponse(HttpStatus.BAD_REQUEST, "Erro ao criar empresa");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping
    @Operation(summary = "Busca todas as empresas", responses = {
            @ApiResponse(responseCode = "200", description = "Empresas encontradas", content = @Content(schema = @Schema(implementation = Empresa.class))),
            @ApiResponse(responseCode = "404", description = "Nenhuma empresa encontrada", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<?> buscarTodasEmpresa(){
        try {
            List<Empresa> listaEmpresas = empresaService.findAll();
            if (!listaEmpresas.isEmpty()) {
                return ResponseEntity.status(HttpStatus.OK).body(listaEmpresas);
            } else {
                ErrorResponse errorResponse = new ErrorResponse(HttpStatus.OK, "Nenhuma empresa encontrada");
                return ResponseEntity.status(HttpStatus.OK).body(errorResponse);
            }
        } catch(Exception e) {
            logger.error("Erro ao buscar todas as empresas", e);
            ErrorResponse errorResponse = new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao buscar empresas");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/listEmpresas")
    @Operation(summary = "Busca todas as empresas paginada", responses = {
            @ApiResponse(responseCode = "200", description = "Empresas encontradas", content = @Content(schema = @Schema(implementation = Empresa.class))),
            @ApiResponse(responseCode = "404", description = "Nenhuma empresa encontrada", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<?> buscarTodasEmpresa(@RequestParam(value = "page", defaultValue = "1") int page,
                                                @RequestParam(value = "size", defaultValue = "15") int size,
                                                @RequestParam(value = "filterValue", defaultValue = "") String filterValue) {
        try {
            PaginatedResponse<Empresa> listaEmpresas = empresaService.findByPaginated(page,size,filterValue);
            if (listaEmpresas != null) {
                return ResponseEntity.status(HttpStatus.OK).body(listaEmpresas);
            } else {
                ErrorResponse errorResponse = new ErrorResponse(HttpStatus.OK, "Nenhuma empresa encontrada");
                return ResponseEntity.status(HttpStatus.OK).body(errorResponse);
            }
        } catch (Exception e) {
            logger.error("Erro ao buscar todas as empresas", e);
            ErrorResponse errorResponse = new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao buscar empresas");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @DeleteMapping(value="{id}")
    @Operation(summary = "Deleta uma empresa pelo ID", responses = {
            @ApiResponse(responseCode = "200", description = "Empresa deletada com sucesso", content = @Content(schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "404", description = "Empresa não encontrada", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<?> deletarEmpresa(@PathVariable("id") String id) {
        try {
            boolean deletado = empresaService.deleteEmpresaById(id);

            if (deletado) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Empresa deletada com sucesso.");
                return ResponseEntity.status(HttpStatus.OK).body(response);
            } else {
                ErrorResponse errorResponse = new ErrorResponse(HttpStatus.NOT_FOUND, "Empresa não encontrada.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
        } catch (Exception e) {
            logger.error("Erro ao deletar a empresa com ID: " + id, e);
            ErrorResponse errorResponse = new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao deletar a empresa.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}