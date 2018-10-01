package server

import (
	"encoding/json"
	"fmt"
	"io"
	"time"

	"k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/labels"
	"k8s.io/apimachinery/pkg/selection"
)

var projections = map[string]func() projection{
	"daemonsets":  func() projection { return &daemonset{} },
	"deployments": func() projection { return &deployment{} },
	"events":      func() projection { return &event{} },
	"pods":        func() projection { return &pod{} },
	"services":    func() projection { return &service{} },
	"":            func() projection { return &defaultObject{} },
}

func toSelectorString(ps *metav1.LabelSelector) string {
	if ps == nil {
		return "false (does not match anything)"
	}
	if len(ps.MatchLabels)+len(ps.MatchExpressions) == 0 {
		return "true (matches everything)"
	}
	selector := labels.NewSelector()
	for k, v := range ps.MatchLabels {
		r, err := labels.NewRequirement(k, selection.Equals, []string{v})
		if err != nil {
			return "<invalid: " + err.Error() + ">"
		}
		selector = selector.Add(*r)
	}
	for _, expr := range ps.MatchExpressions {
		var op selection.Operator
		switch expr.Operator {
		case metav1.LabelSelectorOpIn:
			op = selection.In
		case metav1.LabelSelectorOpNotIn:
			op = selection.NotIn
		case metav1.LabelSelectorOpExists:
			op = selection.Exists
		case metav1.LabelSelectorOpDoesNotExist:
			op = selection.DoesNotExist
		default:
			return "<invalid operator " + fmt.Sprint(op) + ">"
		}
		r, err := labels.NewRequirement(expr.Key, op, append([]string(nil), expr.Values...))
		if err != nil {
			return "<invalid: " + err.Error() + ">"
		}
		selector = selector.Add(*r)
	}
	return selector.String()
}

func toSelectorStringFromMap(ps map[string]string) string {
	if ps == nil {
		return "false (does not match anything)"
	}
	if len(ps) == 0 {
		return "true (matches everything)"
	}
	selector := labels.NewSelector()
	for k, v := range ps {
		r, err := labels.NewRequirement(k, selection.Equals, []string{v})
		if err != nil {
			return "<invalid: " + err.Error() + ">"
		}
		selector = selector.Add(*r)
	}
	return selector.String()
}

type defaultObject struct {
	Metadata struct {
		Namespace         string            `json:"namespace"`
		Name              string            `json:"name"`
		Labels            map[string]string `json:"labels"`
		CreationTimestamp *time.Time        `json:"creationTimestamp"`
	} `json:"metadata"`
}

func (d *defaultObject) clear() {
	d.Metadata.Namespace = ""
	d.Metadata.Name = ""
	d.Metadata.Labels = nil
	d.Metadata.CreationTimestamp = nil
}

func (d *defaultObject) projectData(w io.Writer) error {
	data, err := json.Marshal(d)
	if err != nil {
		return err
	}
	_, err = w.Write(data)
	return err
}

type derivedData struct {
	Selector string `json:"selector,omitempty"`
	Ready    string `json:"ready,omitempty"`
}

type derivedObject struct {
	defaultObject
	Derived derivedData `json:"derived"`
}

type deployment struct {
	defaultObject
	Spec struct {
		Selector *metav1.LabelSelector `json:"selector"`
	} `json:"spec"`
	Status struct {
		Replicas      int `json:"replicas"`
		ReadyReplicas int `json:"readyReplicas"`
	} `json:"status"`
}

func (d *deployment) clear() {
	d.defaultObject.clear()
	d.Spec.Selector = nil
	d.Status.Replicas = 0
	d.Status.ReadyReplicas = 0
}

func (d *deployment) projectData(w io.Writer) error {
	out := derivedObject{
		defaultObject: d.defaultObject,
		Derived: derivedData{
			Selector: toSelectorString(d.Spec.Selector),
			Ready:    fmt.Sprintf("%d / %d", d.Status.ReadyReplicas, d.Status.Replicas),
		},
	}
	data, err := json.Marshal(out)
	if err != nil {
		return err
	}
	_, err = w.Write(data)
	return err
}

type daemonset struct {
	defaultObject
	Spec struct {
		Selector *metav1.LabelSelector `json:"selector"`
	} `json:"spec"`
	Status struct {
		NumberAvailable int `json:"numberAvailable"`
		NumberReady     int `json:"numberReady"`
	} `json:"status"`
}

func (d *daemonset) clear() {
	d.defaultObject.clear()
	d.Spec.Selector = nil
	d.Status.NumberAvailable = 0
	d.Status.NumberReady = 0
}

func (d *daemonset) projectData(w io.Writer) error {
	out := derivedObject{
		defaultObject: d.defaultObject,
		Derived: derivedData{
			Selector: toSelectorString(d.Spec.Selector),
			Ready:    fmt.Sprintf("%d / %d", d.Status.NumberReady, d.Status.NumberAvailable),
		},
	}
	data, err := json.Marshal(out)
	if err != nil {
		return err
	}
	_, err = w.Write(data)
	return err
}

type service struct {
	defaultObject
	Spec struct {
		Selector  map[string]string `json:"selector"`
		Ports     []v1.ServicePort  `json:"ports"`
		ClusterIP string            `json:"clusterIP"`
	} `json:"spec"`
	Derived struct {
		Selector string `json:"selector"`
	} `json:"derived"`
}

func (s *service) clear() {
	s.defaultObject.clear()
	s.Spec.Selector = nil
	s.Spec.Ports = nil
	s.Spec.ClusterIP = ""
	s.Derived.Selector = ""
}

func (s *service) projectData(w io.Writer) error {
	s.Derived.Selector = toSelectorStringFromMap(s.Spec.Selector)
	data, err := json.Marshal(s)
	if err != nil {
		return err
	}
	_, err = w.Write(data)
	return err
}

type event struct {
	defaultObject
	InvolvedObject v1.ObjectReference `json:"involvedObject"`
	Count          int                `json:"count"`
	Type           string             `json:"type"`
	Message        string             `json:"message"`
}

func (e *event) clear() {
	e.defaultObject.clear()
	e.Count = 0
	e.Type = ""
	e.Message = ""
}

func (e *event) projectData(w io.Writer) error {
	data, err := json.Marshal(e)
	if err != nil {
		return err
	}
	_, err = w.Write(data)
	return err
}

type pod struct {
	defaultObject
	Spec struct {
		NodeName string `json:"nodeName"`
	}
	Status v1.PodStatus `json:"status"`
}

type outPod struct {
	defaultObject
	Derived struct {
		NodeName string `json:"nodeName"`
		IP       string `json:"ip"`
		Restarts int    `json:"restarts"`
		Status   string `json:"status"`
		Ready    string `json:"ready"`
	} `json:"derived"`
}

func (p *pod) clear() {
	p.defaultObject.clear()
}

func (p *pod) projectData(w io.Writer) error {
	out := outPod{
		defaultObject: p.defaultObject,
	}

	out.Derived.IP = p.Status.PodIP
	out.Derived.NodeName = p.Spec.NodeName
	out.Derived.Status = fmt.Sprint(p.Status.Phase)

	var restarts, ready, total int

	processStatus := func(statuses []v1.ContainerStatus) {
		for _, s := range statuses {
			total++
			if s.Ready {
				ready++
			}
			restarts += int(s.RestartCount)
		}
	}
	processStatus(p.Status.InitContainerStatuses)
	processStatus(p.Status.ContainerStatuses)

	out.Derived.Ready = fmt.Sprintf("%d / %d", ready, total)
	out.Derived.Restarts = restarts

	data, err := json.Marshal(out)
	if err != nil {
		return err
	}
	_, err = w.Write(data)
	return err
}
