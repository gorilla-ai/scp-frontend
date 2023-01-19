import React from 'react'
import Roles from './index'
import Config from '../../../common/configuration'

describe('<Roles />', () => {
  beforeEach(() => {
    <Config
      hidden={true} />

    cy.intercept('/SCP/api/account/privileges?getPermits=*', { fixture: 'privileges.json' }).as('privilegesAPI')

    cy.mount(<Roles />)
  })

  it('Should have the correct length of data', () => {
    cy.wait('@privilegesAPI')
    cy.get('.MuiTableBody-root tr.MuiTableRow-root').should('have.length', 2)
  })

  it('When click on the add privilege button, privilege add dialog should appear', () => {
    cy.get('[id=privilegeAddDialog]').should('not.exist')
    cy.get('[data-cy=add-role]').click()
    cy.get('[id=privilegeAddDialog]').should('exist')
  })

  it('When click on More button, menu shoud appear', () => {
    cy.get('#privilegesEditBtn').should('not.visible')
    cy.get('[data-testid=MUIDataTableBodyRow-1]').within(() => {
      cy.get('button.MuiButton-root').click()
    })
    cy.get('#privilegesEditBtn').should('be.visible')
  })

  it('When click on edit in menu, privilege edit dialog should appear', () => {
    cy.get('[id=privilegeEditDialog]').should('not.exist')
    cy.get('[data-testid=MUIDataTableBodyRow-1]').within(() => {
      cy.get('button.MuiButton-root').click()
    })
    cy.get('#privilegesEditBtn').click()
    cy.get('[id=privilegeEditDialog]').should('exist')
  })

  it('When click on delete in menu, confirm dialog should appear', () => {
    cy.get('#modalWindowSmall').should('not.exist')
    cy.get('[data-testid=MUIDataTableBodyRow-1]').within(() => {
      cy.get('button.MuiButton-root').click()
    })
    cy.get('#privilegesDeleteBtn').click()
    cy.get('#modalWindowSmall').should('exist')
  })
})