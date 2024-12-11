package br.com.algsoftwares.config;

import br.com.algsoftwares.exception.EchoException;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.FileInputStream;
import java.io.IOException;

@Configuration
public class FirebaseConfig {

    @Bean
    public Firestore firestore() throws IOException {
        // Carregar as credenciais do arquivo JSON do classpath
        GoogleCredentials credentials = GoogleCredentials.fromStream(new ClassPathResource("firebase-adminsdk.json").getInputStream());

        // Configurar o FirebaseApp sem a URL do banco de dados para Firestore
        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(credentials)
                .build();

        // Inicializar o FirebaseApp (se ainda não estiver inicializado)
        if (FirebaseApp.getApps().isEmpty()) {
            FirebaseApp.initializeApp(options);
        }

        // Obter a instância do Firestore
        return FirestoreClient.getFirestore();
    }
}
