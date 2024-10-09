import {
  Button,
  Divider,
  Form,
  FormInstance,
  Input,
  InputNumber,
  PaginationProps,
  Popconfirm,
  Table,
  Tooltip,
  Typography,
} from "antd";
import type * as React from "react";
import {
  HTMLAttributes,
  ReactNode,
  Ref,
  useEffect,
  useRef,
  useState,
} from "react";
import { ColumnType, TableRef } from "antd/lib/table";
import { AnyObject } from "antd/es/_util/type";
import { SizeType } from "antd/lib/config-provider/SizeContext";
import type { TableProps as RcTableProps } from "rc-table/lib/Table";
import { DataIndex } from "rc-table/lib/interface";
import {
  MessageProperty,
  popSuccess,
  popError,
} from "../notification/pop-message.component";
import { ColumnGroupType } from "antd/es/table/interface";

export type RowRecord<T> = T & {
  _id: React.Key;
  __newRecord__?: boolean;
};

interface EditableCellProps<T> extends HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  editRender:
    | "number"
    | "text"
    | ((record: RowRecord<T>, form: FormInstance) => ReactNode);
  record: RowRecord<T>;
  index: number;
  form: FormInstance;
  children: ReactNode;
}

interface CustomOperation<T> {
  confirmWithMessage?: (record: RowRecord<T>) => string | ReactNode;
  text:
    | ReactNode
    | string
    | ((record: RowRecord<T>, disabled: boolean) => ReactNode | string);
  whenPerform: (record: RowRecord<T>) => Promise<MessageProperty | void>;
  available?: (record: RowRecord<T>, data: RowRecord<T>[]) => boolean;
  disabled?: (
    record: RowRecord<T>,
    data: RowRecord<T>[],
  ) => { message: string } | false;
  tooltip?: {
    title: string;
    backgroundColor?: string;
  };
}

export type DataTableColumn<T> = (
  | ColumnGroupType<RowRecord<T>>
  | ColumnType<RowRecord<T>>
) & {
  editRender?:
    | "input"
    | "number"
    | ((rowData: RowRecord<T> | null, form: FormInstance) => ReactNode);
  nameWhenAppending?: string | string[];
  filterable?: boolean;
  newRecordInputRender?:
    | "input"
    | "number"
    | ((rowData: RowRecord<T> | null, form: FormInstance) => ReactNode);
  sysGen?: boolean;
  children?: DataTableColumn<T>[];
};

export interface DataTableSetting<T> {
  tableHeader?: ReactNode;
  tableClassName?: string;
  numbered?: boolean;
  numberedWidth?: number;
  appendable?:
    | false
    | {
        onAppend: (
          newRowData: RowRecord<T> & Record<any, any>,
        ) => Promise<MessageProperty>;
      };
  editable?:
    | false
    | {
        onEditDone: (
          _id: React.Key,
          newRecord: RowRecord<T>,
        ) => Promise<MessageProperty>;
      };
  removable?:
    | false
    | { onRemove: (_id: React.Key) => Promise<MessageProperty> };
  bordered?: boolean;
  customizedOperations?: Array<
    | CustomOperation<T>
    | {
        element: (record: RowRecord<T>, data: RowRecord<T>[]) => ReactNode;
      }
  >;
  operationColumnIndex?: number;
  operationColumnTitle?: string;
  operationColumnClass?: string;
  operationColumnWidth?: number;
  pagination?: PaginationProps;
  size?: SizeType;
  scroll?: RcTableProps["scroll"];
  messagePopDuration?: number;
}

export interface DataTableConfiguration<T> {
  data: RowRecord<T>[];
  columnsDef: Array<DataTableColumn<T>>;
  setting: DataTableSetting<T>;
  loading: boolean;
  style?: React.CSSProperties;
}

const EditableCell = <T,>({
  editing,
  dataIndex,
  title,
  editRender,
  record,
  index,
  children,
  form,
  ...restProps
}: EditableCellProps<T>) => {
  return (
    <td {...restProps} key={index}>
      {editing && !!editRender ? (
        typeof editRender === "string" ? (
          <Form.Item
            name={dataIndex}
            style={{
              margin: 0,
            }}
            rules={[
              {
                required: true,
                message: `${title} is required`,
              },
            ]}
          >
            {editRender === "number" ? <InputNumber /> : <Input />}
          </Form.Item>
        ) : (
          editRender(record, form)
        )
      ) : (
        children
      )}
    </td>
  );
};

export const DataTable = <T,>({
  data,
  columnsDef,
  setting,
  loading,
  style,
}: DataTableConfiguration<T>) => {
  const [form] = Form.useForm();
  const [newRecordForm] = Form.useForm();

  const [tableData, setTableData] = useState<T[]>();

  const [editingKey, setEditingKey] = useState<React.Key>("");
  const [currentPage, setCurrentPage] = useState(1);
  const ref: Ref<TableRef> = useRef(null);

  const tableColumns = [...columnsDef];

  const isEditing = (record: RowRecord<T>) => record._id === editingKey;

  const pageSize = setting.pagination?.pageSize
    ? setting.pagination?.pageSize
    : 10;

  const pagination = () => {
    const paginationSetting = setting.pagination;

    if (paginationSetting === undefined) {
      return {
        current: currentPage,
        onChange: (nextPage: number) => setCurrentPage(nextPage),
        pageSize: pageSize,
      };
    } else {
      if (paginationSetting) {
        return {
          ...setting.pagination,
          current: currentPage,
          onChange: (nextPage: number) => {
            if (paginationSetting.onChange) {
              paginationSetting.onChange(nextPage, pageSize);
            }
            setCurrentPage(nextPage);
          },
        };
      } else {
        // null or false will not enable pagination
        return false;
      }
    }
  };

  if (setting.numbered) {
    tableColumns.unshift({
      title: "No.",
      dataIndex: "number",
      sysGen: true,
      fixed: "left",
      width: setting.numberedWidth || undefined,
      render: (_: any, __: T, index: number) => (
        <span>{index + 1 + pageSize * (currentPage - 1)}</span>
      ),
    });
  } else if (setting.appendable) {
    tableColumns.unshift({
      title: "",
      dataIndex: "",
      sysGen: true,
      render: (_, record) => {
        if (record.__newRecord__) {
          return (
            <Tooltip title={"Created in this session"}>
              <span className={"cursor-default"}>🆕</span>
            </Tooltip>
          );
        } else {
          return "";
        }
      },
    });
  }

  const edit = (record: RowRecord<T>) => {
    form.setFieldsValue({
      ...record,
    });
    setEditingKey(record._id);
  };

  const cancel = () => {
    setEditingKey("");
  };

  const save = async (_id: React.Key) => {
    if (setting.editable) {
      try {
        const row = await form.validateFields();
        try {
          const actionExecution = await setting.editable.onEditDone(_id, row);
          popSuccess({
            ...actionExecution,
            duration: actionExecution.duration || setting.messagePopDuration,
          });
        } catch (error) {
          popError({
            content: (error as Error).message,
            duration: setting.messagePopDuration,
          });
        }
        setEditingKey("");
      } catch (errInfo) {
        console.log("Validate Failed:", errInfo);
      }
    }
  };

  const doDelete = async (key: React.Key) => {
    if (setting.removable) {
      try {
        const actionExecution = await setting.removable.onRemove(key);
        popSuccess({
          ...actionExecution,
          duration: actionExecution.duration || setting.messagePopDuration,
        });
      } catch (error) {
        popError({
          content: (error as Error).message,
          duration: setting.messagePopDuration,
        });
      }
    }
  };

  const performCustomAction = async (
    record: RowRecord<T>,
    whenPerform: (record: RowRecord<T>) => Promise<MessageProperty | void>,
  ) => {
    try {
      const customActionExecution = await whenPerform(record);
      if (customActionExecution) {
        popSuccess({
          ...customActionExecution,
          duration:
            customActionExecution.duration || setting.messagePopDuration,
        });
      }
    } catch (error) {
      popError({
        content: (error as Error).message,
        duration: setting.messagePopDuration,
      });
    }
  };

  const onCreateNewRecord = async () => {
    if (setting.appendable) {
      try {
        const row = await newRecordForm.validateFields();
        try {
          const actionExecution = await setting.appendable.onAppend(row);
          popSuccess({
            ...actionExecution,
            duration: actionExecution.duration || setting.messagePopDuration,
          });

          const totalPages = Math.ceil((data.length + 1) / pageSize);
          setCurrentPage(totalPages);
          newRecordForm.resetFields();
        } catch (error) {
          popError({
            content: (error as Error).message,
            duration: setting.messagePopDuration,
          });
        }
      } catch (errInfo) {
        console.log("Validate Failed:", errInfo);
      }
    } else {
      console.error("No action defined for saving new record");
    }
  };

  const colTransformer = (col: DataTableColumn<T>): DataTableColumn<T> => {
    if (Object(col).hasOwnProperty("children")) {
      return {
        ...col,
        children: (col as ColumnGroupType<T>).children.map((childCol) =>
          colTransformer(childCol as DataTableColumn<T>),
        ),
      };
    }

    if (col.sysGen) {
      return col;
    }

    const getCellValue = (
      dataItem: RowRecord<T>,
      dataIndex: DataIndex | undefined,
    ) => {
      if (typeof dataIndex === "string") {
        return dataItem[dataIndex as keyof RowRecord<T>];
      } else if (Array.isArray(dataIndex)) {
        let currentLevel: any = dataItem;
        for (const key of dataIndex) {
          currentLevel = currentLevel[key as keyof RowRecord<T>];
          if (!currentLevel) {
            return undefined;
          }
        }
        return currentLevel;
      }
    };

    return {
      ...col,
      onCell: (record: RowRecord<T>) => {
        let predefinedOnCell: React.HTMLAttributes<any> &
          React.TdHTMLAttributes<any> = {};
        if (col.onCell) {
          predefinedOnCell = col.onCell(record);
        }
        return {
          ...predefinedOnCell,
          record,
          editRender: col.editRender,
          dataIndex: (col as ColumnType<T>).dataIndex,
          editing: isEditing(record),
          form: form,
        };
      },
      filters: col.filterable
        ? Array.from(
            new Set(
              data.map((item) =>
                getCellValue(item, (col as ColumnType<T>).dataIndex),
              ),
            ),
          )
            .filter((item) => item)
            .map((item) => ({ text: item, value: item }))
        : col.filters,
      onFilter: col.filterable
        ? (value: React.Key | boolean, record: RowRecord<T>) =>
            getCellValue(record, (col as ColumnType<T>).dataIndex) === value
        : col.onFilter,
      filterSearch: true,
    };
  };
  const mergedColumns: () => DataTableColumn<T>[] = () =>
    tableColumns.map(colTransformer);

  const newRecordRow = () => {
    return (
      <Table.Summary.Row>
        <Form component={false} autoComplete="off" form={newRecordForm}>
          <Table.Summary.Cell index={0}>+</Table.Summary.Cell>
          {columnsDef.map((col) => {
            let renderer;
            if (col.newRecordInputRender === undefined) {
              renderer = col.editRender;
            } else {
              renderer = col.newRecordInputRender;
            }
            if (!!renderer) {
              if (typeof renderer === "string") {
                return (
                  <Table.Summary.Cell index={1}>
                    <Form.Item
                      name={col.nameWhenAppending}
                      style={{
                        margin: 0,
                      }}
                      rules={[
                        {
                          required: true,
                          message: `New ${col.title} is required`,
                        },
                      ]}
                    >
                      {renderer === "number" ? (
                        <InputNumber placeholder={`New ${col.title}`} />
                      ) : (
                        <Input placeholder={`New ${col.title}`} />
                      )}
                    </Form.Item>
                  </Table.Summary.Cell>
                );
              } else {
                return (
                  <Table.Summary.Cell index={1}>
                    {renderer(null, newRecordForm)}
                  </Table.Summary.Cell>
                );
              }
            }
          })}
          <Table.Summary.Cell index={3}>
            <Form.Item
              style={{
                margin: 0,
              }}
            >
              <Button type="primary" onClick={onCreateNewRecord}>
                Create
              </Button>
            </Form.Item>
          </Table.Summary.Cell>
        </Form>
      </Table.Summary.Row>
    );
  };

  if (setting.editable || setting.removable || setting.customizedOperations) {
    const actionColumn = {
      title: setting.operationColumnTitle || "Operation",
      width: setting.operationColumnWidth || undefined,
      sysGen: true,
      className: setting.operationColumnClass || "",
      render: (_: any, record: RowRecord<T>) => {
        const editing = isEditing(record);

        const generateActions = (): ReactNode[] => {
          const actions: ReactNode[] = [];

          if (setting.editable) {
            if (editing) {
              actions.push(
                <span>
                  <Typography.Link
                    onClick={() => save(record._id)}
                    style={{
                      marginRight: 8,
                    }}
                  >
                    Save
                  </Typography.Link>
                  <Typography.Link onClick={cancel}>Cancel</Typography.Link>
                </span>,
              );
              return actions;
            } else {
              actions.push(
                <Typography.Link
                  disabled={editingKey !== ""}
                  onClick={() => edit(record)}
                >
                  Edit
                </Typography.Link>,
              );
            }
          }
          if (setting.removable) {
            actions.push(
              <Popconfirm
                title={`Are you sure to remove this?`}
                onConfirm={() => doDelete(record._id)}
              >
                <Typography.Link disabled={editingKey !== ""}>
                  Remove
                </Typography.Link>
              </Popconfirm>,
            );
          }
          if (setting.customizedOperations) {
            setting.customizedOperations.forEach((customAction) => {
              if ("element" in customAction) {
                actions.push(customAction.element(record, data));
              } else {
                const {
                  confirmWithMessage,
                  text,
                  whenPerform,
                  available,
                  disabled,
                  tooltip,
                } = customAction;
                const actionExists = available ? available(record, data) : true;
                const disabledAction = disabled
                  ? disabled(record, data)
                  : false;

                const renderedText =
                  typeof text === "function"
                    ? text(record, !!disabledAction)
                    : text;

                if (actionExists) {
                  if (confirmWithMessage) {
                    actions.push(
                      <Popconfirm
                        disabled={editingKey !== "" || !!disabledAction}
                        title={confirmWithMessage(record)}
                        onConfirm={() =>
                          performCustomAction(record, whenPerform)
                        }
                      >
                        <Tooltip
                          open={
                            !!disabledAction
                              ? undefined
                              : tooltip
                                ? undefined
                                : false
                          }
                          title={
                            !!disabledAction
                              ? disabledAction.message
                              : tooltip
                                ? tooltip.title
                                : false
                          }
                          color={tooltip ? tooltip.backgroundColor : undefined}
                        >
                          <Typography.Link
                            disabled={!!disabledAction || editingKey !== ""}
                          >
                            {renderedText}
                          </Typography.Link>
                        </Tooltip>
                      </Popconfirm>,
                    );
                  } else {
                    actions.push(
                      <Tooltip
                        open={
                          !!disabledAction
                            ? undefined
                            : tooltip
                              ? undefined
                              : false
                        }
                        title={
                          !!disabledAction
                            ? disabledAction.message
                            : tooltip
                              ? tooltip.title
                              : false
                        }
                        color={tooltip ? tooltip.backgroundColor : undefined}
                      >
                        <Typography.Link
                          disabled={editingKey !== "" || !!disabledAction}
                          onClick={() =>
                            performCustomAction(record, whenPerform)
                          }
                        >
                          {renderedText}
                        </Typography.Link>
                      </Tooltip>,
                    );
                  }
                }
              }
            });
          }
          return actions;
        };

        return generateActions().reduce(
          (acc, x) =>
            acc === null ? (
              x
            ) : (
              <>
                {acc} <Divider type={"vertical"} /> {x}
              </>
            ),
          null,
        );
      },
    };
    if (typeof setting.operationColumnIndex === "number") {
      tableColumns.splice(setting.operationColumnIndex, 0, actionColumn);
    } else {
      tableColumns.push(actionColumn);
    }
  }

  useEffect(() => {
    if (data) {
      setTableData([...data]);
    }
  }, [data]);

  useEffect(() => {
    if (ref.current) {
      const resultTableWrapper = ref.current.nativeElement;
      const resultTableContent =
        resultTableWrapper.querySelector<HTMLElement>(`.ant-table-content`);
      const resultActualTable =
        resultTableWrapper.querySelector<HTMLElement>(`table`);

      if (resultActualTable && resultTableContent) {
        if (
          resultActualTable.getBoundingClientRect().width >
          resultTableWrapper.getBoundingClientRect().width
        ) {
          let pos = { top: 0, left: 0, x: 0, y: 0 };
          const mouseDownHandler = (e: Event) => {
            pos = {
              left: resultTableContent.scrollLeft,
              top: resultTableContent.scrollTop,
              // Get the current mouse position
              x: (e as MouseEvent).clientX,
              y: (e as MouseEvent).clientY,
            };

            document.addEventListener("mousemove", mouseMoveHandler);
            document.addEventListener("mouseup", mouseUpHandler);
          };
          const mouseMoveHandler = (e: Event) => {
            resultTableContent.style.userSelect = "none";
            resultTableContent.style.cursor = "grabbing";
            // How far the mouse has been moved
            const dx = (e as MouseEvent).clientX - pos.x;
            const dy = (e as MouseEvent).clientY - pos.y;

            // Scroll the element
            resultTableContent.scrollTop = pos.top - dy;
            resultTableContent.scrollLeft = pos.left - dx;
          };

          const mouseUpHandler = function () {
            resultTableContent.style.cursor = "unset";
            resultTableContent.style.removeProperty("user-select");

            document.removeEventListener("mousemove", mouseMoveHandler);
            document.removeEventListener("mouseup", mouseUpHandler);
          };
          const scrollableColumns =
            resultTableWrapper.querySelectorAll(`.drag-to-scroll`);
          scrollableColumns.forEach((c) =>
            c.addEventListener("mousedown", mouseDownHandler),
          );
        }
      }
    }
  }, [ref.current]);

  return (
    <Form form={form} component={false}>
      <Table
        ref={ref}
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        className={`${setting.tableClassName}`}
        loading={loading}
        title={setting.tableHeader ? () => setting.tableHeader : undefined}
        summary={() => (setting.appendable ? newRecordRow() : null)}
        dataSource={tableData as (AnyObject & RowRecord<T>)[]}
        columns={mergedColumns()}
        rowClassName={(record) => {
          if (record.__newRecord__) {
            return "new-record-row";
          }
          return setting.editable ? "editable-row" : "";
        }}
        size={setting.size || "small"}
        bordered={!!setting.bordered}
        style={style || { marginBottom: 30 }}
        pagination={pagination()}
        scroll={setting.scroll}
      />
    </Form>
  );
};
