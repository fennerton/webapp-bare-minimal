import { Divider, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  DataTable,
  DataTableColumn,
  DataTableSetting,
} from "../../components/data-table/data-table.component";
import { Endpoint } from "../../constants/endpoints.enum";
import httpClient from "../../utils/http-client.util";
import { popError } from "../../components/notification/pop-message.component";
import { Template } from "../../../interfaces/template";

type EmailTemplateData = Template & { _id: string };

export const EmailTemplateListPage = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<EmailTemplateData[]>([]);

  const columnsDef: DataTableColumn<Template>[] = [
    {
      title: "Name",
      dataIndex: "name",
    },
  ];
  const setting: DataTableSetting<Template> = {
    customizedOperations: [
      {
        text: "Check Detail",
        whenPerform: async (record) => {},
      },
    ],
  };

  useEffect(() => {
    (async () => {
      try {
        const response = await httpClient.post<Template[]>(
          Endpoint.EMAIL_TEMPLATE_LIST,
        );
        setData(response.data.map((d, i) => ({ ...d, _id: i.toString() })));
        setLoading(false);
      } catch (e) {
        popError("Unable to fetch email templates");
      }
    })();
  }, []);

  return (
    <div>
      <Typography.Title level={5} className={"flex items-center"}>
        <Link to={"."} className={"!text-primary hover:!opacity-55"}>
          Email Template
        </Link>
        <Divider type={"vertical"} className={"transform rotate-12"} />
        <span className="text-accent rounded-md">List</span>
      </Typography.Title>
      <DataTable
        data={data}
        columnsDef={columnsDef}
        setting={setting}
        loading={loading}
      />
    </div>
  );
};
