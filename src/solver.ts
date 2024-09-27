// TODO instead of probability, work with confidence
// a probability of 0 means to be certain that a statement is not true
// in these calculations, a confidence of 0 means that we have no clue

function combine(s1:Statement, s2:Statement) : Statement {
	if (!s1) return;
	if (!s2) return;
	if (s2 instanceof Implication) [s1, s2] = [s2, s1];

	if (s1 instanceof Implication && s2 instanceof RelationInstance) {
		if (s1.r1target == s2.target && s1.r1 == s2.relation) {
			return new RelationInstance(s2.subject, s1.r2, s1.r2target, s1.probability * s2.probability);
		}
		// TODO reverse direction!
	}

	if (s1 instanceof RelationInstance && s2 instanceof RelationInstance) {
		if (s1.relation == s2.relation) {
			return new RelationInstance(s1.subject, s1.relation, s2.target, s1.probability * s2.probability);
		}
	}

	// TODO combine Implication and Implication

	return null;
}

export class Item {
	name:string;
	constructor(name:string) {
		this.name = name;
	}
}

export class Statement {
	probability:number;
	constructor(probability:number) {
		this.probability = probability;
	}
	/**
	 * Combines this statement with a list of statements.
	 * @param statements statements to combine with.
	 * @returns statements deduced by the combination.
	 */
	combine(statements:Statement[]) : Statement[] {
		let res:Statement[] = [];
		statements.forEach(other => {
			let combined = combine(this, other);
			if (combined && !statements.includes(combined)) {
				res.push(combined);
			}
		});
		return res;
	}
}

export class Relation {
	positive:string;
	negative:string;
	transitive:number;
	constructor(positive:string, negative:string, transitive:number) {
		this.positive = positive;
		this.negative = negative;
		this.transitive = transitive;
	}
	inverse() {
		return new Relation(this.negative, this.positive, this.transitive);
	}
}

export class RelationInstance extends Statement {
	subject:Item;
	target:Item;
	relation:Relation;
	constructor(item1:Item, relation:Relation, item2:Item, probability:number=1) {
		super(probability);
		this.subject = item1;
		this.target = item2;
		this.relation = relation;
	}
	toString() {
		if (this.probability > .5) {
			return `${this.subject.name} ${this.relation.positive} ${this.target.name} (${(this.probability * 100).toFixed(2)}%)`;
		}
		return `${this.subject.name} ${this.relation.negative} ${this.target.name} (${(this.probability * 100).toFixed(2)}%)`;
	}
}

export class Implication extends Statement {
	r1:Relation;
	r1target:Item;
	r2:Relation;
	r2target:Item;
	constructor(relation1:Relation, item1:Item, relation2:Relation, item2:Item, probability:number) {
		super(probability);
		this.r1 = relation1;
		this.r2 = relation2;
		this.r1target = item1;
		this.r2target = item2;
	}
	toString() {
		if (this.probability > .5) {
			return `if x ${this.r1.positive} ${this.r1target.name} then x ${this.r2.positive} ${this.r2target.name} (${(this.probability * 100).toFixed(2)}%)`;
		}
		return `if x ${this.r1.positive} ${this.r1target.name} then x ${this.r2.negative} ${this.r2target.name} (${(this.probability * 100).toFixed(2)}%)`;
	}
}
