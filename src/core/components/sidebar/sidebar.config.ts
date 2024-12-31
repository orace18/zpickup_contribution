export const MENU_CONFIG = {
  dashboard: {
    title: 'Tableau de bord',
    items: [
      {
        route: '/cartes',
        title: 'Cartes en temps réel',
        permission: 'view_users'
      },
      {
        route: '/users',
        title: 'Utilisateurs',
        permission: 'view_users'
      },
      {
        route: '/tickets',
        title: 'Tickets & Chats',
        permission: 'view_users'
      },
      {
        route: '/settings',
        title: 'Paramètres',
        permission: 'manage_settings'
      },
      {
        route: '/assureurs',
        title: 'Assureurs',
        permission: 'view_users'
      },
      {
        route: '/statistiques',
        title: 'Statistiques',
        permission: 'view_users'
      }
    ]
  }
};
