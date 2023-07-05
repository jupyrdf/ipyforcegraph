*** Settings ***
Resource            ../_resources/keywords/Browser.robot
Resource            ../_resources/keywords/Lab.robot
Resource            ../_resources/keywords/IPyForceGraph.robot
Resource            ../_resources/keywords/Regression.robot
Resource            ../_resources/keywords/Screenshots.robot
Library             Collections

Test Teardown       Clean up after IPyForceGraph Example

Test Tags           regression    gh:103


*** Test Cases ***
Non-text 2D text is displayed
    [Documentation]    Ensure non-text values can be provided to 2d text renderer.
    ${frame} =    Set Variable    css:${IPYFORCEGRAPH FRAME}
    ${screens} =    Prepare Regression Test    gh-103
    ${transparent} =    Get Element Screenshot Size    ${frame}    ${screens}    01-transparent.png

    Add And Run JupyterLab Code Cell    task \= asyncio.create_task(test_async_text())
    Wait Until Page Contains    OK TEXT
    Add And Run JupyterLab Code Cell    task.result()
    ${non_text} =    Get Element Screenshot Size    ${frame}    ${screens}    02-text.png
    Page Should Not Contain Standard Errors
    Should Be True Or Screenshot    ${non_text} > ${transparent}    03-text-bigger-than-transparent.png

    Add And Run JupyterLab Code Cell    task \= asyncio.create_task(test_async_non_text())
    Wait Until Page Contains    OK NON-TEXT
    ${non_text} =    Get Element Screenshot Size    ${frame}    ${screens}    04-non-text.png
    Page Should Not Contain Standard Errors
    Should Be True Or Screenshot    ${non_text} > ${transparent}    05-non-text-bigger-than-transparent.png

    Capture Page Screenshot    01-no-errors.png
