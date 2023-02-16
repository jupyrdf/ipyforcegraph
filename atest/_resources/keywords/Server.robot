*** Settings ***
Library     OperatingSystem
Library     Process
Library     String
Resource    Lab.robot
Resource    Browser.robot
Resource    Meta.robot
Resource    ../variables/Server.robot


*** Keywords ***
Setup Server and Browser
    ${nb_dir} =    Initialize Jupyter Directory
    Wait For New Jupyter Server To Be Ready    jupyter-lab    notebook_dir=${nb_dir}
    ...    cwd=${nb_dir}
    ...    stdout=${OUTPUT_DIR}${/}jupyter-lab.log
    ...    stderr=STDOUT
    Open JupyterLab
    Set Window Size    1920    1080

Initialize Jupyter Directory
    [Documentation]    Configure the settings directory, and modify settings that make tests less reproducible
    ${nb_dir} =    Set Variable    ${OUTPUT_DIR}${/}nb
    ${etc} =    Set Variable    ${nb_dir}${/}.etc
    Create Directory    ${etc}
    Copy File    ${IPYFORCEGRAPH_FIXTURES}${/}${NBSERVER CONF}    ${etc}${/}.etc${/}${NBSERVER CONF}
    Set Environment Variable    JUPYTER_CONFIG_DIR    ${etc}
    ${settings} =    Set Variable    ${etc}${/}lab${/}user-settings
    Create File
    ...    ${settings}${/}@jupyterlab${/}codemirror-extension${/}commands.jupyterlab-settings
    ...    {"styleActiveLine": true}
    Create File
    ...    ${settings}${/}@jupyterlab${/}extensionmanager-extension${/}plugin.jupyterlab-settings
    ...    {"enabled": false}
    Create File
    ...    ${settings}${/}@jupyterlab${/}apputils-extension${/}palette.jupyterlab-settings
    ...    {"modal": false}
    RETURN    ${nb_dir}

Tear Down Everything
    Close All Browsers
    Run Keyword and Ignore Error    Terminate All Jupyter Servers
