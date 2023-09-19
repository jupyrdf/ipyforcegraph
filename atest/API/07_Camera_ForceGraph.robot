*** Settings ***
Resource        ../_resources/keywords/Server.robot
Resource        ../_resources/keywords/Browser.robot
Resource        ../_resources/keywords/Lab.robot
Resource        ../_resources/keywords/IPyForceGraph.robot
Resource        ../_resources/keywords/Screenshots.robot
Library         Collections
Library         JupyterLibrary
Library         OperatingSystem

Force Tags      suite:camera


*** Variables ***
${SCREENS}      ${SCREENS ROOT}${/}api


*** Test Cases ***
Camera Can Observe ForceGraph Nodes
    Camera Works As Expected    ForceGraph


*** Keywords ***
Camera Works As Expected
    [Arguments]    ${widget_class}
    ${context} =    Set Variable    ${widget_class.lower()}_camera
    ${screens} =    Set Variable    ${SCREENS}${/}${context}
    Maybe Skip A Test    widget_class=${widget_class}    feature=camera
    Set Screenshot Directory    ${screens}
    Initialize Coverage Kernel    ${FAKE_HOME}    api-camera-${context}
    Set Up Camera Example    ${widget_class}
    ${frame} =    Set Variable    css:${IPYFORCEGRAPH FRAME}
    ${on_camera} =    Get Element Screenshot Size    ${frame}    ${screens}    01-on-camera.png
    ${off_camera} =    Zooming To Coordinates Works As Expected    ${frame}    ${on_camera}    ${screens}
    Zooming To Nodes Works As Expected    ${frame}    ${off_camera}    ${screens}
    [Teardown]    Clean Up Camera Example

Zooming To Coordinates Works As Expected
    [Arguments]    ${frame}    ${on_camera}    ${screens}
    Add And Run JupyterLab Code Cell
    ...    d.center = [-999, -999]
    Wait For All Cells To Run
    Sleep    1s
    ${off_camera} =    Get Element Screenshot Size    ${frame}    ${screens}    02-off-camera.png
    Should Be True Or Screenshot    ${on_camera} > ${off_camera}    03-on-camera-bigger-than-off-camera.png
    RETURN    ${off_camera}

Zooming To Nodes Works As Expected
    [Arguments]    ${frame}    ${off_camera}    ${screens}
    Add And Run JupyterLab Code Cell    d.visible = n
    Wait For All Cells To Run
    Sleep    1s
    ${on_nodes} =    Get Element Screenshot Size    ${frame}    ${screens}    04-on-nodes.png
    Should Be True Or Screenshot    ${on_nodes} > ${off_camera}    05-on-nodes-bigger-than-off-camera.png
    RETURN    ${off_camera}

Set Up Camera Example
    [Arguments]    ${widget_class}
    Set Tags    widget:${widget_class.lower()}
    ${text} =    Get File    ${IPYFORCEGRAPH_FIXTURES}${/}api${/}Camera.py
    ${text} =    Set Variable    ${text.replace("WIDGET_CLASS", "${widget_class}")}
    Log    ${text}
    Launch A New JupyterLab Document
    Set CodeMirror Value    .jp-CodeCell .CodeMirror    ${text.strip()}
    Execute JupyterLab Command    Show Log Console
    Execute JupyterLab Command    Run All Cells
    Wait Until Force Graph Is Visible
    Capture Page Screenshot    00-start.png

Clean Up Camera Example
    Capture Page Screenshot    99-fin.png
    ${nb_dir} =    Get Jupyter Directory
    Remove File    ${nb_dir}${/}Untitled.ipynb
    Refresh File List
    Try To Close All Tabs
