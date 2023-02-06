import React from 'react'
import Pattern from './pattern'
import Config from '../../common/configuration'

describe('<Pattern />', () => {
  beforeEach(() => {
    <Config
      hidden={true} />

    cy.mount(<Pattern />)
  })

  it('When click on the Add Pattern button, add pattern form should appear', () => {
    cy.get('[id=addPatternForm]').should('not.exist')
    cy.get('[data-cy=add-pattern]').click()
    cy.get('[id=addPatternForm]').should('exist')
  })

  it('When click on the enable Incident Template button, incident form should appear', () => {
    cy.get('[data-cy=add-pattern]').click()
    cy.get('[id=incidentSettingsForm]').should('not.exist')
    cy.get('[id=incidentTemplateSwitch]').click()
    cy.get('[id=incidentSettingsForm]').should('exist')
  })

  it('When click on the disable Incident Template button, incident form should disappear', () => {
    cy.get('[data-cy=add-pattern]').click()
    cy.get('[id=incidentTemplateSwitch]').click()
    cy.get('[id=incidentSettingsForm]').should('exist')
    cy.get('[id=incidentTemplateSwitch]').click()
    cy.get('[id=incidentSettingsForm]').should('not.exist')
  })
})