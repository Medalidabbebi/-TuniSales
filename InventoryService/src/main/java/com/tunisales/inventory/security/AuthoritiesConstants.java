package com.tunisales.inventory.security;

/**
 * Constants for Spring Security authorities.
 */
public final class AuthoritiesConstants {

    public static final String ADMIN = "ROLE_ADMIN";
    public static final String USER = "ROLE_USER";
    public static final String ANONYMOUS = "ROLE_ANONYMOUS";

    public static final String ADMIN_SYSTEME = "ROLE_ADMIN_SYSTEME";
    public static final String ADMIN_COMMERCIAL = "ROLE_ADMIN_COMMERCIAL";
    public static final String COMMERCIAL = "ROLE_COMMERCIAL";
    public static final String MAGASINIER = "ROLE_MAGASINIER";
    public static final String CHEF_PARC = "ROLE_CHEF_PARC";
    public static final String RESPONSABLE_PV = "ROLE_RESPONSABLE_PV";
    public static final String VENDEUR = "ROLE_VENDEUR";
    public static final String ADMIN_CLIENT = "ROLE_ADMIN_CLIENT";

    private AuthoritiesConstants() {}
}
