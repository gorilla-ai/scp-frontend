import React from 'react'
import IncidentManagement from './incident-manager'
import SocConfig from '../common/soc-configuration'

describe('<IncidentManagement />', () => {
  beforeEach(() => {
    <SocConfig
      hidden={true} />

    cy.mount(<IncidentManagement />)
  })

  it('When click on the Export Monthly Report button, monthly report export dialog should appear', () => {
    cy.get('[id=statisticsReportDialog]').should('not.exist')
    cy.get('[data-cy=export-statistics-report]').click()
    cy.get('[id=statisticsReportDialog]').should('exist')
  })
})