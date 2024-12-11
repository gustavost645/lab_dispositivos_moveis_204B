package br.com.algsoftwares.controller;

import br.com.algsoftwares.entities.Empresa;
import br.com.algsoftwares.entities.Produto;
import br.com.algsoftwares.exception.EchoException;
import br.com.algsoftwares.service.ProdutoService;
import br.com.algsoftwares.utils.ErrorResponse;
import br.com.algsoftwares.utils.PaginatedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.ValidationException;
import org.hibernate.sql.exec.ExecutionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    private static final Logger logger = LoggerFactory.getLogger(ProdutoController.class);

    @Autowired
    private ProdutoService produtoService;

    @PostMapping
    @Operation(summary = "Cria um novo produto", responses = {
            @ApiResponse(responseCode = "201", description = "Produto criado com sucesso", content = @Content(schema = @Schema(implementation = Produto.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<?> criarProduto(@RequestBody Produto produto)  {
        try {
            Produto novoProduto = produtoService.saveProduto(produto);
            return ResponseEntity.status(HttpStatus.CREATED).body(novoProduto);
        }catch (Exception e) {
            logger.error("Erro ao criar/atualizar produto", e);
            ErrorResponse errorResponse = new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao criar/atualizar produto");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @DeleteMapping(value="{empresaId}/{id}")
    @Operation(summary = "Deleta um produto pelo ID", responses = {
            @ApiResponse(responseCode = "200", description = "Produto deletado com sucesso", content = @Content(schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "404", description = "Produto não encontrada", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<?> deletarProduto(@PathVariable("empresaId") String empresaId, @PathVariable("id") String id) {
        try {
            boolean deletado = produtoService.deleteProdutoById(empresaId, id);

            if (deletado) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Produto deletado com sucesso.");
                return ResponseEntity.status(HttpStatus.OK).body(response);
            } else {
                ErrorResponse errorResponse = new ErrorResponse(HttpStatus.NOT_FOUND, "Empresa não encontrada.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
        } catch (Exception e) {
            logger.error("Erro ao deletar o produto com ID: " + id, e);
            ErrorResponse errorResponse = new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao deletar a empresa.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/listProdutos")
    @Operation(summary = "Busca paginada", responses = {
            @ApiResponse(responseCode = "200", description = "Produtos encontrados", content = @Content(schema = @Schema(implementation = Produto.class))),
            @ApiResponse(responseCode = "404", description = "Produtos não encontrados", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<?> listarProdutos(@RequestParam(value = "page", defaultValue = "1") int page,
                                            @RequestParam(value = "size", defaultValue = "15") int size,
                                            @RequestParam(value = "filterValue", defaultValue = "") String filterValue,
                                            @RequestParam(value = "empresa", defaultValue = "") String empresaValue) {
        try {
            PaginatedResponse<Produto> listaProdutos = produtoService.findByPaginated(page, size, filterValue, empresaValue);
            if (listaProdutos!= null) {
                return ResponseEntity.status(HttpStatus.OK).body(listaProdutos);
            } else {
                ErrorResponse errorResponse = new ErrorResponse(HttpStatus.OK, "Produto não encontrado");
                return ResponseEntity.status(HttpStatus.OK).body(errorResponse);
            }
        } catch (Exception e) {
            logger.error("Erro ao buscar produtos", e);
            ErrorResponse errorResponse = new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao buscar produtos");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }



}
