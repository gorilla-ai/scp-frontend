import React from 'react'
import AccountList from './index'
import Config from '../../../common/configuration'

describe('<AccountList />', () => {
  beforeEach(() => {
    <Config
      hidden={true} />

    cy.intercept('/SCP/api/account/v2/_search?page=*&pageSize=*&orders=*', { fixture: 'account.json' }).as('accountAPI')

    cy.mount(<AccountList />)
  })

  // it('Should load the Account data', () => {
  //   cy.wait('@accountAPI').then(({response}) => {
  //     console.log(response.body.rows)
  //   })
  // })

  it('Should have the correct length of data', () => {
    cy.wait('@accountAPI')
    cy.get('.MuiTableBody-root tr.MuiTableRow-root').should('have.length', 2)
  })

  it('When click on the AD settings button, AD settings dialog should appear', () => {
    cy.get('[id=adConfigModalDialog]').should('not.exist')
    cy.get('[data-cy=ad-account]').click()
    cy.get('[id=adConfigModalDialog]').should('exist')
  })

  it('When click on the add account button, account edit dialog should appear', () => {
    cy.get('[id=accountEditDialog]').should('not.exist')
    cy.get('[data-cy=add-account]').click()
    cy.get('[id=accountEditDialog]').should('exist')
  })

  it('When click on More button, menu shoud appear', () => {
    cy.get('#account-menu-edit').should('not.visible')
    cy.get('[data-testid=MUIDataTableBodyRow-1]').within(() => {
      cy.get('button.MuiButton-root').click()
    })
    cy.get('#account-menu-edit').should('be.visible')
  })

  it('When click on edit in menu, account edit dialog should appear', () => {
    cy.get('[id=accountEditDialog]').should('not.exist')
    cy.get('[data-testid=MUIDataTableBodyRow-1]').within(() => {
      cy.get('button.MuiButton-root').click()
    })
    cy.get('#account-menu-edit').click()
    cy.get('[id=accountEditDialog]').should('exist')
  })

  it('When click on delete in menu, confirm dialog should appear', () => {
    cy.get('#modalWindowSmall').should('not.exist')
    cy.get('[data-testid=MUIDataTableBodyRow-1]').within(() => {
      cy.get('button.MuiButton-root').click()
    })
    cy.get('#account-menu-delete').click()
    cy.get('#modalWindowSmall').should('exist')
  })

  it('When click on reset password in menu, reset password dialog should appear', () => {
    cy.get('#adminResetPasswordDialog').should('not.exist')
    cy.get('[data-testid=MUIDataTableBodyRow-1]').within(() => {
      cy.get('button.MuiButton-root').click()
    })
    cy.get('#account-menu-reset').click()
    cy.get('#adminResetPasswordDialog').should('exist')
  })
})