
"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'EN' | 'PT';

const translations = {
    EN: {
        // General
        login: 'Login',
        logout: 'Logout',
        sign_up: 'Sign Up',
        dashboard: 'Dashboard',
        email: 'Email',
        password: 'Password',

        // Landing Page
        welcome_to_recolixo: 'Welcome to RECOLIXO',
        modern_solution_for_waste_management: 'The modern solution for waste management.',
        service_providers: 'Service Providers',
        manage_clients_routes_and_payments: 'Manage clients, routes, and payments.',
        provider_description: 'Access your dashboard to track collections, view client information on an interactive map, and manage financials.',
        go_to_provider_dashboard: 'Go to Provider Dashboard',
        clients: 'Clients',
        track_collections_and_manage_payments: 'Track collections and manage payments.',
        client_description: 'View your collection schedule, report your garbage status, track your service in real-time, and handle payments easily.',
        go_to_client_dashboard: 'Go to Client Dashboard',

        // Login Page
        login_to_recolixo: 'Login to RECOLIXO',
        enter_credentials: 'Enter your credentials to access your account.',
        logging_in: 'Logging in...',
        dont_have_account: "Don't have an account?",
        login_successful: 'Login Successful',
        redirecting_to_dashboard: 'Redirecting to your dashboard...',
        
        // Signup Page
        create_account: 'Create an Account',
        join_recolixo: "Join RECOLIXO today. It's quick and easy.",
        full_name: 'Full Name',
        i_am_a: 'I am a...',
        client_radio: 'Client (I need garbage collection)',
        provider_radio: 'Service Provider (I offer collection services)',
        creating_account: 'Creating Account...',
        already_have_account: 'Already have an account?',
        account_created: 'Account Created!',
        redirecting_to_login: 'You have successfully signed up. Redirecting to login...',

        // Provider Layout
        collection_map: 'Collection Map',
        payments: 'Payments',
        fleet: 'Fleet',
        workforce: 'Workforce',
        subscription: 'Subscription',
        home_page: 'Home Page',
        provider_dashboard: 'Provider Dashboard',
        
        // Client Layout
        make_payment: 'Make a Payment',
    },
    PT: {
        // General
        login: 'Entrar',
        logout: 'Sair',
        sign_up: 'Registar',
        dashboard: 'Painel de Controlo',
        email: 'Email',
        password: 'Palavra-passe',

        // Landing Page
        welcome_to_recolixo: 'Bem-vindo à RECOLIXO',
        modern_solution_for_waste_management: 'A solução moderna para a gestão de resíduos.',
        service_providers: 'Provedores de Serviço',
        manage_clients_routes_and_payments: 'Faça a gestão de clientes, rotas e pagamentos.',
        provider_description: 'Aceda ao seu painel para rastrear coletas, visualizar informações de clientes num mapa interativo e gerir as finanças.',
        go_to_provider_dashboard: 'Ir para o Painel do Provedor',
        clients: 'Clientes',
        track_collections_and_manage_payments: 'Acompanhe as coletas e faça a gestão de pagamentos.',
        client_description: 'Veja o seu calendário de coletas, reporte o estado do seu lixo, acompanhe o serviço em tempo real e trate dos pagamentos facilmente.',
        go_to_client_dashboard: 'Ir para o Painel do Cliente',
        
        // Login Page
        login_to_recolixo: 'Entrar na RECOLIXO',
        enter_credentials: 'Insira as suas credenciais para aceder à sua conta.',
        logging_in: 'A entrar...',
        dont_have_account: 'Não tem uma conta?',
        login_successful: 'Login com sucesso',
        redirecting_to_dashboard: 'A redirecionar para o seu painel...',

        // Signup Page
        create_account: 'Criar uma Conta',
        join_recolixo: 'Junte-se à RECOLIXO hoje. É rápido e fácil.',
        full_name: 'Nome Completo',
        i_am_a: 'Eu sou...',
        client_radio: 'Cliente (preciso de coleta de lixo)',
        provider_radio: 'Provedor de Serviço (ofereço serviços de coleta)',
        creating_account: 'A criar conta...',
        already_have_account: 'Já tem uma conta?',
        account_created: 'Conta Criada!',
        redirecting_to_login: 'Registou-se com sucesso. A redirecionar para o login...',

        // Provider Layout
        collection_map: 'Mapa de Coleta',
        payments: 'Pagamentos',
        fleet: 'Frota',
        workforce: 'Força de Trabalho',
        subscription: 'Subscrição',
        home_page: 'Página Inicial',
        provider_dashboard: 'Painel do Provedor',

        // Client Layout
        make_payment: 'Fazer um Pagamento',
    }
};

interface LanguageContextType {
    language: Language;
    toggleLanguage: () => void;
    t: (key: keyof typeof translations.EN) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<Language>('EN');

    const toggleLanguage = () => {
        setLanguage(prevLang => prevLang === 'EN' ? 'PT' : 'EN');
    };

    const t = (key: keyof typeof translations.EN): string => {
        return translations[language][key] || translations['EN'][key];
    };
    
    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
