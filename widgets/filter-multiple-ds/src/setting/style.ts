import { ThemeVariables, css, SerializedStyles, polished } from 'jimu-core'

export function getStyleForFI (theme: ThemeVariables): SerializedStyles {
  return css`
  @media only screen and (max-width: 621px){
    .filter-item {
      .sql-expression-inline{
            display: grid !important;
            grid-template-columns: 1fr !important;
            grid-template-rows: 1fr 0.25fr !important;
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
    .filter-cancel-button {
      width: 100%;
    }
    .filter-item-panel{
      .setting-header {
        padding: ${polished.rem(10)} ${polished.rem(16)} ${polished.rem(0)} ${polished.rem(16)}
      }

      .setting-title {
        font-size: ${polished.rem(16)};
        .filter-item-label{
          color: ${theme.colors.palette.dark[600]};
        }
      }

      .setting-container {
        height: calc(100% - ${polished.rem(50)});
        overflow: auto;

        .title-desc{
          color: ${theme.colors.palette.dark[200]};
        }


      }
    }
  `
}

export function getStyleForWidget (theme: ThemeVariables): SerializedStyles {
  return css`
    .widget-setting-filter{
      .filter-items-desc{
        color: ${theme.colors.palette.dark[400]};
      }
      .and-or-group .max-width-50{
        max-width: 50%;
      }
      .filter-item {
        display: flex;
        padding: 0.5rem 0.75rem;
        margin-bottom: 0.25rem;
        line-height: 23px;
        cursor: pointer;
        background-color: ${theme.colors.secondary};

        .filter-item-icon{
          width: 14px;
          margin-right: 0.5rem;
        }
        .filter-item-name{
          word-break: break-all;
        }
      }

      .filter-item-active {
        border-left: 2px solid ${theme.colors.palette.primary[600]};
      }


      .empty-placeholder {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        flex-flow: column;
        align-items: center;
        padding: 2rem;
        .empty-placeholder-text {
          color: ${theme.colors.palette.dark[500]};
          font-size: ${polished.rem(14)};
          margin-top: 16px;
          text-align: center;
        }
        .empty-placeholder-icon {
          color: ${theme.colors.palette.dark[200]};
        }
      }

      .arrange-style-container{

        .arrange_container, .trigger_container{
          margin-top: 10px;
          display: flex;
          justify-content: space-between;
          .jimu-btn {
            padding: 0;
            background: ${theme.colors.palette.light[200]};
            &.active{
              border: 2px solid ${theme.colors.palette.primary[600]};
            }
          }
        }
        .trigger_container{
          justify-content: flex-start;
          .jimu-btn:last-of-type{
            margin-left: 0.5rem;
          }
        }

        .omit-label{
          color: ${theme.colors.palette.dark[400]};
        }
      }

      .options-container {
        .use-wrap{
          .jimu-widget-setting--row-label{
            margin-right: 5px;
          }
        }
      }
    }
  `
}
