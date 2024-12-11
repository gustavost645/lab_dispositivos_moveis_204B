package br.com.algsoftwares.service;

import br.com.algsoftwares.entities.Usuario;
import br.com.algsoftwares.utils.RegisterRequest;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    public Usuario registerUser(RegisterRequest request) {
        try {
            // Criar usuário no Firebase
            UserRecord.CreateRequest firebaseRequest = new UserRecord.CreateRequest()
                    .setDisplayName(request.getName())
                    .setEmail(request.getEmail())
                    .setPassword(request.getPassword());

            UserRecord firebaseUser = FirebaseAuth.getInstance().createUser(firebaseRequest);

            Usuario usuario = new Usuario();
            usuario.setId(firebaseUser.getUid());

            return usuario;
        } catch (FirebaseAuthException e) {
            // Tratar erros do Firebase Authentication
            throw new RuntimeException("Erro no Firebase: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Erro ao registrar usuário: " + e.getMessage());
        }
    }

}
