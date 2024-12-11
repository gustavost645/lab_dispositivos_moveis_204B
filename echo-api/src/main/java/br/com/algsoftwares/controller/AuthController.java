package br.com.algsoftwares.controller;

import br.com.algsoftwares.entities.Usuario;
import br.com.algsoftwares.service.UsuarioService;
import br.com.algsoftwares.utils.ErrorResponse;
import br.com.algsoftwares.utils.LoginRequest;
import br.com.algsoftwares.utils.RegisterRequest;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.google.gson.Gson;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/login")
    public ResponseEntity<String> login(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            return ResponseEntity.ok().body(new Gson().toJson(authentication,authentication.getClass()));
        } else {
            ErrorResponse errorResponse = new ErrorResponse(HttpStatus.UNAUTHORIZED, "Falha na autenticação.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse.getErrorMessage());
        }
    }

    @PostMapping("/new_login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest loginRequest) {
        try {
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(loginRequest.getIdToken());

            String uid = decodedToken.getUid();
            String email = decodedToken.getEmail();
            String displayName = decodedToken.getName();

            Map<String, String> response = new HashMap<>();
            response.put("id", uid);
            response.put("login", email);
            response.put("nome", Objects.nonNull(displayName)?displayName:getUsernameFromEmail(email) );
            response.put("token", loginRequest.getIdToken());

            return ResponseEntity.ok(response);

        } catch (FirebaseAuthException e) {
            ErrorResponse errorResponse = new ErrorResponse(HttpStatus.UNAUTHORIZED, "Falha na autenticação: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", errorResponse.getErrorMessage()));
        }
    }

    public static String getUsernameFromEmail(String email) {
        if (email != null && email.contains("@")) {
            return email.split("@")[0];
        }
        return null;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            Usuario newUser = usuarioService.registerUser(registerRequest);

            Map<String, String> response = new HashMap<>();
            response.put("id", newUser.getId());
            response.put("message", "Usuário registrado com sucesso! ID: " + newUser.getId());

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            ErrorResponse errorResponse = new ErrorResponse(HttpStatus.UNAUTHORIZED, ex.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", errorResponse.getErrorMessage()));
        } catch (Exception e) {
            ErrorResponse errorResponse = new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", errorResponse.getErrorMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok("Logout realizado com sucesso.");
    }
}

