package br.com.algsoftwares.controller;

import br.com.algsoftwares.entities.Empresa;
import br.com.algsoftwares.entities.Produto;
import br.com.algsoftwares.service.EmpresaService;
import br.com.algsoftwares.service.ProdutoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.SchemaProperties;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/import")
public class ImportController {

    @Autowired
    private EmpresaService empresaService;

    @Autowired
    private ProdutoService produtoService;

    private static final Logger logger = LoggerFactory.getLogger(ImportController.class);

    @PostMapping(
            value = "/produtos",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<String> importarCSV(
            @RequestPart("file")
            @Schema(description = "Adicione o arquivo para importação aqui", type = "file", format = "binary")
            MultipartFile file,
            @RequestParam("cnpj") String cnpjCpf) {

        if (cnpjCpf == null || cnpjCpf.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("CNPJ/CPF não pode ser vazio.");
        }

        Empresa empresa = empresaService.findByCnpjCpf(cnpjCpf);

        if (empresa == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Empresa não encontrada com o CNPJ/CPF: " + cnpjCpf);
        }

        List<String> erros = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()));
             CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT.withFirstRecordAsHeader())) {

            for (CSVRecord csvRecord : csvParser) {
                try {
                    Produto produto = parseProduto(csvRecord, empresa);
                    produtoService.saveProduto(produto);
                } catch (Exception e) {
                    erros.add("Erro ao importar produto na linha " + csvRecord.getRecordNumber() + ": " + e.getMessage());
                    logger.error("Erro ao importar produto na linha " + csvRecord.getRecordNumber(), e);
                }
            }

            if (!erros.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(String.join("\n", erros));
            }

            return ResponseEntity.ok("Importação de produtos concluída com sucesso.");
        } catch (IOException e) {
            logger.error("Erro ao processar o arquivo CSV", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao processar o arquivo CSV.");
        } catch (NumberFormatException e) {
            logger.error("Erro de conversão de número", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erro: formato de número inválido no arquivo CSV.");
        } catch (Exception e) {
            logger.error("Erro inesperado ao processar o arquivo CSV", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro inesperado ao processar o arquivo CSV.");
        }
    }

    private Produto parseProduto(CSVRecord csvRecord, Empresa empresa) {
        Produto produto = new Produto();
        produto.setCodBarras(csvRecord.get("codBarras"));
        produto.setNomeProduto(csvRecord.get("nomeProduto"));
        produto.setDescricao(csvRecord.get("descricao"));
        produto.setMarca(csvRecord.get("marca"));
        produto.setPreco(new BigDecimal(csvRecord.get("preco").replace(",", ".")));
        produto.setEmpresa(empresa);
        return produto;
    }
}
