# Important: we will try to only have one 'When' step per scenario

Feature: heartbeat

  This is a test of our walking skeleton, before all other end-to-end tests.
  It is the most minimal test we can make of the system from the outside.

  Scenario: server with idle agent 
    Given an agent is running on a target server
    And the agent is connected to the main server
    When a browser views the target server page on the main server
    Then an OK from the agent will be shown
