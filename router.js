import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)

export function createRouter() {
  return new Router({
    mode: 'history',
    routes: [
      {
        path: '/',
        redirect: {
          name: 'multi_guess_AB_login'
        }
      },
      {
        path: '/chat',
        name: 'chatting_room',
        component: require('~/pages/chat').default
      },
      {
        path: '/SingleTicTacToe',
        name: 'single_tictactoe',
        component: require('~/pages/SingleTicTacToe').default
      },
      {
        path: '/SingleGuessAB',
        name: 'single_guess_AB',
        component: require('~/pages/SingleGuessAB').default
      },
      {
        path: '/MultiGuessAB',
        component: require('~/pages/MultiGuessAB').default,
        children: [
          {
            path: '',
            component: require('~/pages/MultiGuessAB/children/Login').default,
            name: 'multi_guess_AB_login'
          },
          {
            path: 'main',
            component: require('~/pages/MultiGuessAB/children/Main').default,
            name: 'multi_guess_AB_main'
          },
          {
            path: ':roomId',
            component: require('~/pages/MultiGuessAB/children/Room').default,
            name: 'multi_guess_AB_room'
          },
          { path: '*', redirect: { name: 'multi_guess_AB' } }
        ]
      }
    ]
  })
}
