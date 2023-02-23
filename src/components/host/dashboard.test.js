import { render, screen } from '@testing-library/react'
import { BrowserRouter as Router } from 'react-router-dom';
import React, {useState} from 'react'
//import userEvent from '@testing-library/user-event'
//import '@testing-library/jest-dom'
import Dashboard from './dashboard'

test('render Host dashboard', () => {
  // ARRANGE
  render(<Router><Dashboard /></Router>)

  // // ACT
  // await userEvent.click(screen.getByText('Load Greeting'))
  // await screen.findByRole('heading')

  // // ASSERT
  // expect(screen.getByRole('heading')).toHaveTextContent('hello there')
  // expect(screen.getByRole('button')).toBeDisabled()
})