import { Injectable } from '@angular/core';

declare global {
    interface Window { Redmine: any; }
}

@Injectable()
export class SideBareService {

  private sideBare: Element;
  public queries: Array<Query>;

  constructor() {
    this.sideBare = window.Redmine.sidebar;
    this.queries = this.parseQueries();
  }

  private parseQueries(): Array<Query>{
    let result = new Array<Query>();
    let queriesNodes = this.sideBare.querySelectorAll(".query");
    for (let i = 0; i < queriesNodes.length; i++) {
        let queryNode = queriesNodes.item(i);
        result.push(new Query(queryNode));
    }
    return result;
  }

}

export class Query {
  label: string;
  url: string;
  id: number;

  constructor(public node : Element) {
    this.label = this.node.textContent;
    this.url = this.node.getAttribute("href");
    this.id = Number(this.url.substr(this.url.indexOf("=")+1));
  }
}
