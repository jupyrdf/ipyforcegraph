*** Settings ***
Resource            ../_resources/keywords/Browser.robot
Resource            ../_resources/keywords/Lab.robot
Resource            ../_resources/keywords/IPyForceGraph.robot
Resource            ../_resources/keywords/Regression.robot
Resource            ../_resources/keywords/Screenshots.robot
Library             Collections

Test Teardown       Clean up after IPyForceGraph Example

Test Tags           regression    gh:109


*** Test Cases ***
Padding Works
    [Documentation]    Ensure graph director padding works.
    ${frame} =    Set Variable    css:${IPYFORCEGRAPH FRAME}
    ${screens} =    Prepare Regression Test    gh-109
    ${default} =    Get Element Screenshot Size    ${frame}    ${screens}    01-default.png

    Add And Run JupyterLab Code Cell    task \= asyncio.create_task(test_async_visible())
    Wait Until Page Contains    OK VISIBLE
    Add And Run JupyterLab Code Cell    task.result()
    ${visible} =    Get Element Screenshot Size    ${frame}    ${screens}    02-visible.png
    Page Should Not Contain Standard Errors
    Should Be True Or Screenshot    ${default} > ${visible}    03-default-bigger-than-visible.png

    Add And Run JupyterLab Code Cell    task \= asyncio.create_task(test_async_padding())
    Wait Until Page Contains    OK PADDING
    ${padding} =    Get Element Screenshot Size    ${frame}    ${screens}    04-padding.png
    Page Should Not Contain Standard Errors
    Should Be True Or Screenshot    ${padding} > ${visible}    05-padding-bigger-than-visible.png

    Capture Page Screenshot    01-no-errors.png
