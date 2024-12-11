package br.com.algsoftwares.authentication;

import com.google.firebase.auth.FirebaseToken;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;

public class FirebaseAuthentication extends AbstractAuthenticationToken {
    private final FirebaseToken firebaseToken;

    public FirebaseAuthentication(FirebaseToken firebaseToken) {
        super(Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));
        this.firebaseToken = firebaseToken;
        setAuthenticated(true);
    }

    @Override
    public Object getCredentials() {
        return firebaseToken;
    }

    @Override
    public Object getPrincipal() {
        return firebaseToken.getUid();
    }
}

