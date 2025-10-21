import { ThemeVariables, css, SerializedStyles, polished, getAppStore } from 'jimu-core'

export function getStyles (theme: ThemeVariables): SerializedStyles {
  const isRTL = getAppStore().getState().appContext.isRTL
  const inputMixWidth = '50%'
  const doubleInputMixWidth = 'auto'
  const doubleDateInputMixWidth = '350px'
  return css`

  @media only screen and (max-width: 621px){
    .filter-item {
      .sql-expression-inline{
            display: grid !important;
            grid-template-columns: 1fr !important;
            grid-template-rows: 1fr 0.25!important;
            grid-template-areas: "filter"
            "reset" !important;
            grid-gap: 15px;
  
       }

      .sql-expression-inline{ 
        .sql-expression-container{
          display: grid !important;
          grid-template-columns: 1fr;
          grid-template-rows: 1fr 1fr 1fr;
          grid-gap: 15px;
          .sql-expression-single{
            .clause-inline{
              justify-content: space-between;
            }
            .sql-expression-label{
              width:25% !important;
              flex-grow:1;
            }
            .sql-expression-input{
              width: 60% !important;
              flex-grow:1;
            }
          }
        }
      }
    }
  }

  @media only screen and (min-width: 622px) and (max-width: 768px) {
    .filter-item {
      .sql-expression-inline{
            display: grid !important;
            grid-template-columns: 1fr !important;
            grid-template-rows: 1fr 0.10fr!important;
            grid-template-areas: "filter reset" !important;
            grid-gap: 15px;
  
       }
      .filter-cancel-button {
        width: 100%;
      }
      .sql-expression-inline{ 
        .sql-expression-container{
          display: grid !important;
          grid-template-columns: 1fr 1fr 1fr;
          grid-gap: 15px;
          .sql-expression-single{
            .sql-expression-input{
              flex-grow:1;
            }
          }
        }
      }
    }
  }

    .filter-item {
      padding-bottom: 0.5rem;

      &.filter-item-popper{
        margin: 0.5rem;
        min-width: ${doubleInputMixWidth};
        max-width: ${doubleDateInputMixWidth};
      }

      .filter-item-inline {
        padding-bottom: 0.5rem;
        padding-top: 0.5rem;

      .filter-item-arrow{
          transform: rotate(${isRTL ? 90 : 270}deg);
      }
      .filter-item-icon{
          margin-right: 0.5rem;

          &.no-arrow{
            margin-left: 0.5rem;
          }
      }
      .filter-item-name{
          font-size: ${polished.rem(13)};
          color: ${theme.colors.black};
          word-break: break-all;
          &.no-icons{
            margin-left: 0.5rem;
          }
          &.toggle-name{
            white-space: nowrap;
            margin-right: 0.5rem;
          }
      }
      .filter-cancel-button {
        width: 100%;
      }

        /* sql-expression-styles - start */
        
        .sql-expression-inline{
          
          display: grid;
          grid-template-columns: 1fr 0.25fr;
          grid-template-areas: 
          "filter reset";
          align-items: center;

          &.sql-expression-wrap{

            .sql-expression-builder{

              .sql-expression-container{

                .sql-expression-set{
                }
              }
            }
          }

          .grid-reset {
            grid-area: reset;
          }
          
          .sql-expression-builder{
              
            .sql-expression-container{                   
              display: flex;
              width:100%;
              justify-content:flex-start;

              .sql-expression-single{
                flex-grow:1 ;
                /* .clause-inline{
                  min-width: ${inputMixWidth};
                }
                .clause-block{
                  .sql-expression-input{
                    min-width: ${inputMixWidth};
                  }
                }
                .sql-expression-displaylabel{
                  min-width: calc(${inputMixWidth}/2);
                } */
              }
              .sql-expression-set{
                display: flex;
              }
            }
          }

        }
        /* sql-expression-styles - end */

      }
    }

    .filter-item:last-child{
      padding-bottom: 0 !important;
    }

    &.filter-items-inline{
      display: inline-block;
      .sql-expression-builder .sql-expression-container .sql-expression-single .sql-expression-input .pill-btn-container{
        flex-wrap: nowrap;
        .pill-btn{
          overflow: visible;
        }
      }

      &.filter-items-wrap{
        flex-wrap: wrap;
        align-content: flex-start;

        .sql-expression-builder .sql-expression-container .sql-expression-single .sql-expression-input .pill-btn-container{
          flex-wrap: wrap;
        }
      }
      .filter-item{
        /* padding: 0; */
        &.filter-item-popper{
          min-width: 300px;
          padding-bottom: 0.5rem;
          .filter-item-inline {
            padding-bottom: 0.5rem;
            padding-top: 0.5rem;
          }
        }
        .filter-item-inline{
          padding: 0;
          /* height: 100%; */
          overflow-y: auto;
          background-color: unset !important;
          border: none !important;

          .filter-expanded-container{
            width: ${doubleInputMixWidth};
            padding-top: 0.5rem;
          }

          /* .filter-item-clause-pill{
            margin: 10px 5px;
            white-space: nowrap;
          } */

          /* .filter-popper-container{ */
            .filter-item-pill{
              margin: 10px 4px;
              white-space: nowrap;

              .sql-expression-single{
                margin: 0;
              }

              &.filter-item-toggle-pill{
                /* &:hover{
                  background-color: ${theme.colors.palette.light[100]};
                } */
                display: flex;
                flex-direction: row;
                height: 32px;
                align-items: center;
                padding: 0 0.5rem;
              }
            /* } */
            /* .pill-display-label{
              white-space: nowrap;
              text-overflow: ellipsis;
              overflow: hidden;
            } */
          }

          /*input editor width*/
          .sql-expression-builder{
            .sql-expression-container{
              .sql-expression-single{
                .clause-inline{
                  justify-content: flex-start;
                  .sql-expression-label{
                    margin-right: 0.5rem;
                    width: auto;
                    overflow: visible;
                  }
                  .sql-expression-input{
                    width: auto;
                  }

                }
                /* .clause-block{ */
                  .sql-expression-input{
                    min-width: ${inputMixWidth};
                    .double-number-picker{
                      min-width: ${doubleInputMixWidth};
                    }
                    .double-datetime-picker{
                      min-width: ${doubleDateInputMixWidth};
                    }
                  }
                /* } */
                .sql-expression-displaylabel{
                  white-space: nowrap;
                  padding-right: 0.5rem;
                  font-size: 13px;
                }
              }
            }
          }

        }
      }
    }

    &.filter-items-popup{
      min-width: ${doubleInputMixWidth};
      max-width: ${doubleDateInputMixWidth};
    }

    .apply-cancel-group{
      white-space: nowrap;
      overflow: visible;
    }
  `
}
